const fs = require("fs");

const file = "./public/index.html";
let html = fs.readFileSync(file, "utf8");

html = html.replace(
  /\\.product-img\\{[\\s\\S]*?\\}/,
  `.product-img{
      width:100%;
      height:220px;
      object-fit:contain;
      border-radius:12px;
      margin-bottom:12px;
      background:#f3eee6;
      display:block;
    }`
);

fs.writeFileSync(file, html, "utf8");
console.log("OK: 商品画像を切れない表示に変更しました");
