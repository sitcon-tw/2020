// tslint:disable: max-line-length

// !WARNING! DO NOT EDIT THIS TEMPLATE EXCEPT YOU UNDERSTAND WHAT ARE YOU ACTUALLY DO.
// This is a announcement template block, edit this and it will auto inject contents as popup-ready DOMElement.

import { markdown } from 'markdown';

const RAWContent = `
# SITCON 2020 籌備團隊公告

## 年會活動延期至 8 月 8 日舉辦

各位關注 SITCON 的朋友大家好：

SITCON 2020 活動確定**延期至 8 月 8 日舉辦**，地點**維持在中研院人文社會科學館**。

因應嚴重特殊傳染性肺炎（COVID-19）疫情，團隊雖然 SITCON 籌備團隊已經針對：現場消毒、參與者健康管理等項目有相關配套，但因

- SITCON 規模達 1,000 人屬於大型活動
- 大多數與會者及工作人員為學生
- 具有較長的時間(長達 8 小時)
- 活動參與者彼此距離多小於一公尺且為不固定座位

於是基於參與者之健康安全考量及

- 教育部建議大型校園活動應暫時避免
- 臺北市教育局公告各校大型集會活動延後至 109 年 5 月 4 日後始得辦理
- 參考中央疫情指揮中心之「COVID-19（武漢肺炎）因應指引：公眾集會」公告

以上政府單位指引

SITCON 籌備團隊共同決議將**活動延期至 8 月 8 日同地點**（中研院人文社會科學館）舉行。
再次感謝各位朋友的支持與關注，因為有你們 SITCON 才能持續運轉。
造成諸多不便還請多見諒。

SITCON 籌備團隊上
2020/03/06

---

參考資料：[疾管署－避免集會群聚感染，指揮中心公布「公眾集會因應指引」](https://www.cdc.gov.tw/Bulletin/Detail/vyRZfHHe_ZR9nMJxN8Nvrg)
`;

const content: string = `${markdown.toHTML(RAWContent)}`;

export default content;
