const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "public", "index.html");

let html = fs.readFileSync(file, "utf8");

// 基本リンク置換
html = html
  .replace(/\[HOME\]/g, "/")
  .replace(/\[MYPAGE\]/g, "#")
  .replace(/\[ALL_VIEW\]/g, "/products.html")
  .replace(/\[COMPANY\]/g, "/company.html")
  .replace(/\[USEINFO\]/g, "/info.html")
  .replace(/\[EMAIL\]/g, "/contact.html")
  .replace(/\[VIEWPRIVERCY\]/g, "/privacy.html")
  .replace(/\[CONTRACT\]/g, "/law.html")
  .replace(/\[NAME\]/g, "手造りえびせんべい 磯屋")
  .replace(/\[COMPANYNAME\]/g, "磯屋")
  .replace(/\[OWNER\]/g, "")
  .replace(/\[ADDRESS\]/g, "")
  .replace(/\[TEL\]/g, "")
  .replace(/\[URL\]/g, "/");

// 検索・ログイン系は一旦削除
html = html
  .replace(/\[LOGINTYPEZ\]/g, "")
  .replace(/\[TOP_SEARCH_INPUT\]/g, "")
  .replace(/\[TOP_SEARCH_BUTTON\]/g, "")
  .replace(/\[TOPIMAGE\]/g, "");

// ランキング・レビュー・ニュース系の残骸を削除
html = html
  .replace(/\[RANK_NO\]/g, "")
  .replace(/\[RANK_ITEMDETAIL\]/g, "/products.html")
  .replace(/\[RANK_IMG_M\]/g, "")
  .replace(/\[RANK_BRANDNAME\]/g, "")
  .replace(/\[RANK_PRICE\]/g, "")
  .replace(/\[ENDRANKING\]/g, "");

// その他の [XXXX] タグを最後に空にする
html = html.replace(/\[[A-Z0-9_]+\]/g, "");

// 明らかなHTMLミス修正
html = html.replace(/<ahref=/g, "<a href=");

// contact.html がまだないので一旦LINEへ
html = html.replace(/href="\/contact\.html"/g, 'href="https://lin.ee/QJ61Cb3"');

fs.writeFileSync(file, html, "utf8");

console.log("cleaned: public/index.html");