const fs = require("fs");

const file = "./public/index.html";
let html = fs.readFileSync(file, "utf8");

const imageUrl = "https://line-render-app-1.onrender.com/uploads/1766470786708_akashi_item.jpg";

// CSS追加
if (!html.includes(".product-img")) {
  html = html.replace(
    `.price{
      font-weight:800;
      color:#8b3a1d;
    }`,
    `.price{
      font-weight:800;
      color:#8b3a1d;
    }
    .product-img{
      width:100%;
      height:180px;
      object-fit:cover;
      border-radius:12px;
      margin-bottom:12px;
      background:#f3eee6;
    }`
  );
}

// オリジナルセットカードに画像追加
html = html.replace(
  `<section class="card">
        <h3>オリジナルセット</h3>`,
  `<section class="card">
        <img src="${imageUrl}" alt="オリジナルセット" class="product-img">
        <h3>オリジナルセット</h3>`
);

fs.writeFileSync(file, html, "utf8");
console.log("OK: オリジナルセット画像を追加しました");
