<template>
  <div
    id="app"
    :class="[
      `theme-${ theme.toLowerCase() }`,
      $route.name === 'CFP' ? 'cfp' : 'main',
      isInApp() ? 'in-app' : '',
      isPopup ? 'popuped' : ''
    ]"
  >
    <Navbar v-if="$route.name !== 'CFP' && !isInApp()"/>
    <Popup
      :isOpen="isPopup"
      :content="popupContent"
    />
    <transition :name="transitionDirect.toLowerCase()">
      <keep-alive>
        <router-view class="transition-group"/>
      </keep-alive>
    </transition>
    <SponsorFooter
      :class="{ 'blur-filter': $route.name === 'Home' }"
    />
    <Footer/>
  </div>
</template>

<script lang="ts">
import { Route } from 'vue-router';

import { Component, Watch, Vue } from 'vue-property-decorator';
import { Action, Getter } from 'vuex-class';

import Navbar from '@/components/Navbar.vue';
import Popup from '@/components/Popup.vue';
import Footer from '@/components/Footer.vue';
import SponsorFooter from '@/components/SponsorFooter.vue';

import { TemplateState } from '@/store/types/template';
import { DeviceType, AppMode, ThemeType } from '@/store/types/app';

import head from '@/util/head';

enum TransitionDirect {
  SLIDE_LEFT = 'slide-left',
  SLIDE_RIGHT = 'slide-right'
}

@Component({
  components: {
    Navbar,
    Popup,
    Footer,
    SponsorFooter
  }
})
export default class App extends Vue {
  @Action('toggleTheme', { namespace: 'app' }) private toggleTheme!: (theme: ThemeType) => void;
  @Action('toggleMode', { namespace: 'app' }) private toggleMode!: (mode: AppMode) => void;
  @Action('toggleDevice', { namespace: 'app' }) private toggleDevice!: (device: DeviceType) => void;
  @Action('togglePopup', { namespace: 'app' }) private togglePopup!: (status: boolean) => void;
  @Action('togglePopupContent', { namespace: 'app' }) private togglePopupContent!: (content: string) => void;
  @Action('getSunRiseSunSetData', { namespace: 'sunRiseSunSet' }) private getSunRiseSunSetData!: () => Promise<void>;
  @Getter('device', { namespace: 'app' }) private device!: DeviceType;
  @Getter('mode', { namespace: 'app' }) private mode!: AppMode;
  @Getter('theme', { namespace: 'app' }) private theme!: ThemeType;
  @Getter('isPopup', { namespace: 'app' }) private isPopup!: boolean;
  @Getter('popupContent', { namespace: 'app' }) private popupContent!: string;
  @Getter('sunrise', { namespace: 'sunRiseSunSet' }) private sunrise!: Date;
  @Getter('sunset', { namespace: 'sunRiseSunSet' }) private sunset!: Date;
  @Getter('announcement', { namespace: 'template' }) private announcement!: string;
  @Getter('submitInfo', { namespace: 'template' }) private submitInfo!: string;
  @Getter('openSubmit', { namespace: 'template' }) private openSubmit!: string;
  @Getter('loudly', { namespace: 'template' }) private loudly!: string;

  private transitionDirect: TransitionDirect = TransitionDirect.SLIDE_LEFT;

  public async mounted () {
    this.autoDetectMetaOg();
    this.detectPopupFromLoadURL();
    this.assignThemePrefixToBody(this.theme);
    this.detectAppMode();
    this.detectDeviceType();
    window.addEventListener('resize', this.detectDeviceType);

    await this.detectSystemPrefersColorSchema();

    window.matchMedia('(prefers-color-scheme: dark)').addListener(async () => {
      await this.detectSystemPrefersColorSchema();
    });

    this.announcementCookieHook();
  }

  @Watch('$route')
  public onChangeRoute (to: Route, from: Route) {
    this.autoDetectMetaOg();
    this.detectPopupFromLoadURL();
    this.detectTransitionDirect(to, from);
  }

  @Watch('isPopup')
  public onChangePopup (value: boolean) {
    this.toggleBodyLock(value);
  }

  @Watch('theme')
  public onThemeChange (theme: ThemeType) {
    this.assignThemePrefixToBody(theme);
  }

  public destroyed () {
    window.removeEventListener('resize', this.detectDeviceType);
  }

  private isInApp (): boolean {
    return this.mode === AppMode.APP;
  }

  private detectedEgg (): boolean {
    const now: Date = new Date();

    return (
      now.getTime() > new Date('2019-10-26').getTime() &&
      now.getTime() < new Date('2019-11-27').getTime()
    );
  }

  private detectAppMode (): void {
    const isApp: boolean = this.$route.query.mode === 'app';

    if (isApp) {
      this.toggleMode(AppMode.APP);
    } else {
      this.toggleMode(AppMode.WEB);
    }
  }

  private detectDeviceType (): void {
    const isDesktop: boolean = window.matchMedia('(min-width: 1024px)').matches;

    if (isDesktop) {
      this.toggleDevice(DeviceType.DESKTOP);
    } else {
      this.toggleDevice(DeviceType.MOBILE);
    }
  }

  private async detectSystemPrefersColorSchema (): Promise<void> {
    const isDarkMode: boolean = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    const isLightMode: boolean = window.matchMedia(
      '(prefers-color-scheme: light)'
    ).matches;

    if (isLightMode) {
      this.detectedEgg()
        ? this.toggleTheme(ThemeType.RAINBOW_LIGHT)
        : this.toggleTheme(ThemeType.LIGHT);
    } else if (isDarkMode) {
      this.detectedEgg()
        ? this.toggleTheme(ThemeType.RAINBOW_DARK)
        : this.toggleTheme(ThemeType.DARK);
    } else {
      await this.getSunRiseSunSetData();
      this.toggleThemeViaSunRiseSunSet();

      setInterval(() => {
        this.toggleThemeViaSunRiseSunSet();
      }, 1000);
    }
  }

  private toggleThemeViaSunRiseSunSet (): void {
    const now = new Date();
    const isEgg: boolean = this.detectedEgg();
    const isDay: boolean =
      now.getTime() > this.sunrise.getTime() &&
      now.getTime() < this.sunset.getTime();

    let themePrefix: string = '';

    if (isEgg) {
      themePrefix = 'RAINBOW_';
    } else {
      themePrefix = '';
    }

    if (isDay) {
      themePrefix += 'LIGHT';
    } else {
      themePrefix += 'DARK';
    }

    this.toggleTheme(ThemeType[themePrefix as keyof typeof ThemeType]);
  }

  private assignThemePrefixToBody (theme: ThemeType): void {
    const bodyDOM = (document.querySelector('body') as HTMLElement);
    bodyDOM.classList.remove('theme-dark');
    bodyDOM.classList.remove('theme-light');
    bodyDOM.classList.remove('theme-rainbow-dark');
    bodyDOM.classList.add(`theme-${theme}`);
  }

  private detectPopupFromLoadURL (): void {
    if (this.$route.query && this.$route.query.popUp) {
      switch (this.$route.query.popUp) {
        case 'submitInfo':
          this.togglePopupContent(this.submitInfo);
          this.togglePopup(true);
          break;
        case 'openSubmit':
          this.togglePopupContent(this.openSubmit);
          this.togglePopup(true);
          break;
        case 'loudly':
          this.togglePopupContent(this.loudly);
          this.togglePopup(true);
          break;
        case 'announcement':
          this.togglePopupContent(this.announcement);
          this.togglePopup(true);
        default: break;
      }
    }
  }

  private detectTransitionDirect (to: Route, from: Route): void {
    if (to.meta.index < from.meta.index) {
      this.transitionDirect = TransitionDirect.SLIDE_RIGHT;
    } else {
      this.transitionDirect = TransitionDirect.SLIDE_LEFT;
    }
  }

  private toggleBodyLock (isLock: boolean): void {
    if (isLock) {
      (document.querySelector('body') as HTMLElement).classList.add('popup-scrolling-lock');
    } else {
      (document.querySelector('body') as HTMLElement).classList.remove('popup-scrolling-lock');
    }
  }

  private autoDetectMetaOg (): void {
    switch (this.$route.name) {
      case 'Agenda':
        head.title('議程表');
        head.ogTitle('議程表');
        head.ogDescription('SITCON 2020 邀請身為學生的你，向大家分享您的經驗與技術，期待您能在演講桌前，與我們一起 #define student。');
        head.ogUrl('https://sitcon.org/2020/agenda/');
        head.ogImage('https://sitcon.org/2020/img/og.png');

        break;

      case 'Traffic':
        head.title('交通方式');
        head.ogTitle('交通方式');
        head.ogDescription('SITCON 2020 邀請身為學生的你，向大家分享您的經驗與技術，期待您能在演講桌前，與我們一起 #define student。');
        head.ogUrl('https://sitcon.org/2020/traffic/');
        head.ogImage('https://sitcon.org/2020/img/og.png');

        break;

      case 'Team':
      case 'Team/Staff':
      case 'Team/Sponsor':
      case 'Team/You':
        head.title('SITCON 團隊');
        head.ogTitle('SITCON 團隊');
        head.ogDescription('SITCON 學生計算機年會為學生自發組成籌辦的研討會，秉持著以學生為主軸的核心價值，提供一個經驗交流與資訊技術實務分享的平台，進而達到「學以致用、教學相長」的目標；而維繫這樣的交流平台，需要多人的努力及貢獻，亦十分需要在資金上的支持。');
        head.ogUrl('https://sitcon.org/2020/team/');
        head.ogImage('https://sitcon.org/2020/img/og.png');

        break;

      case 'Venue':
        head.title('會場地圖');
        head.ogTitle('會場地圖');
        head.ogDescription('SITCON 2020 邀請身為學生的你，向大家分享您的經驗與技術，期待您能在演講桌前，與我們一起 #define student。');
        head.ogUrl('https://sitcon.org/2020/traffic/');
        head.ogImage('https://sitcon.org/2020/img/og.png');

        break;

      default: break;
    }
  }

  private setAnnouncementCookie (): void {
    this.$cookies.set('announcement', '9f7f1055-f3ab-4694-8f96-a0a0c47095a2', Infinity, '*', 'sitcon.org');

    // Fix Safari
    this.$cookies.set('announcement', '9f7f1055-f3ab-4694-8f96-a0a0c47095a2', Infinity, '', 'sitcon.org');
  }

  private announcementCookieHook (): void {
    const announcementId: string = this.$cookies.get('announcement');

    if (announcementId !== '9f7f1055-f3ab-4694-8f96-a0a0c47095a2') {
      setTimeout(() => {
        this.$router.push({ name: this.$route.name, query: { popUp: 'announcement' } });
      }, 1000);
      this.setAnnouncementCookie();
    }
  }
}
</script>

<style lang="scss">
@import "@/assets/scss/main.scss";
</style>
