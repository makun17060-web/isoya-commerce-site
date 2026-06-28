const fs = require("fs");
const path = require("path");
const iconv = require("iconv-lite");

const ROOT = __dirname;
const SRC = path.join(ROOT, "public_migrated");
const OUT = path.join(ROOT, "public");

// まずは EUC-JP。まだ文字化けするなら "Shift_JIS" に変える
const SOURCE_ENCODING = "EUC-JP";

function read(name) {
  const p = path.join(SRC, name);
  if (!fs.existsSync(p)) {
    console.log(`missing: ${name}`);
    return "";
  }

  const buffer = fs.readFileSync(p);
  return iconv.decode(buffer, SOURCE_ENCODING);
}

function cleanMakeshopTags(html) {
  return html
    .replace(/\[HOME\]/g, "/")
    .replace(/\[BASKET\]/g, "/cart.html")
    .replace(/\[LOGIN\]/g, "#")
    .replace(/\[LOGOUT\]/g, "#")
    .replace(/\[MEMBER\]/g, "#")
    .replace(/\[SEARCH\]/g, "/products.html")
    .replace(/\[NEW\]/g, "/products.html")
    .replace(/\[RECOMMEND\]/g, "/products.html")
    .replace(/\[RANKING\]/g, "/products.html")
    .replace(/\[NEWS\]/g, "#")
    .replace(/\[IF_END\]/g, "")
    .replace(/\[ENDIF\]/g, "")
    .replace(/\[IF_[A-Z0-9_]+\]/g, "")
    .replace(/\[ENDIF_[A-Z0-9_]+\]/g, "")
    .replace(/javascript:ssl_login\('member'\)/g, "#")
    .replace(/\/shopdetail\/000000000021\/all_items\/page1\/order\//g, "/products.html")
    .replace(/shopbrand\/all_items\//g, "/products.html")
    .replace(/\/html\/company\.html/g, "/company.html")
    .replace(/\/html\/info\.html/g, "/info.html");
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

ensureDir(OUT);
ensureDir(path.join(OUT, "css"));
ensureDir(path.join(OUT, "images"));

// 画像コピー
const srcImages = path.join(SRC, "images", "makeshop");
const outImages = path.join(OUT, "images", "makeshop");

if (fs.existsSync(srcImages)) {
  fs.cpSync(srcImages, outImages, { recursive: true });
}

// CSSもEUC-JP → UTF-8に変換
const cssText = read("m_sys_common.txt");
fs.writeFileSync(path.join(OUT, "css", "makeshop.css"), cssText, "utf8");

// HTML部品をEUC-JP → UTF-8に変換して合体
const topmenu = cleanMakeshopTags(read("design_topmenu.txt"));
const main = cleanMakeshopTags(read("design_mainpage.txt"));
const bottom = cleanMakeshopTags(read("design_bottom.txt"));

const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>手造りえびせんべい 磯屋</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="/css/makeshop.css">
</head>
<body>

${topmenu}

${main}

${bottom}

</body>
</html>
`;

fs.writeFileSync(path.join(OUT, "index.html"), html, "utf8");

console.log("created: public/index.html");
console.log("encoding: " + SOURCE_ENCODING + " -> UTF-8");