const fs = require("fs");

const file = "./public/index.html";
let html = fs.readFileSync(file, "utf8");

// 既存の .product-img CSS を全部削除
html = html.replace(/\.product-img\s*\{[\s\S]*?\}/g, "");

// </style> の直前に、切れない画像CSSを追加
html = html.replace(
  "</style>",
  `
    .product-img{
      width:100%;
      height:auto;
      max-height:none;
      object-fit:contain;
      border-radius:12px;
      margin-bottom:12px;
      background:#f3eee6;
      display:block;
    }
  </style>`
);

// 念のため、画像タグにも直接 style を入れる
html = html.replace(
  /<img src="https:\/\/line-render-app-1\.onrender\.com\/uploads\/1766470786708_akashi_item\.jpg" alt="オリジナルセット" class="product-img"[^>]*>/,
  `<img src="https://line-render-app-1.onrender.com/uploads/1766470786708_akashi_item.jpg" alt="オリジナルセット" class="product-img" style="width:100%;height:auto;object-fit:contain;display:block;">`
);

fs.writeFileSync(file, html, "utf8");
console.log("OK: 商品画像を縦横比そのまま表示に修正しました");
