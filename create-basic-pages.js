const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "public");

function page(title, body) {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>${title}｜手造りえびせんべい 磯屋</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="/css/makeshop.css">
  <style>
    .simple-page {
      max-width: 960px;
      margin: 40px auto;
      padding: 24px;
      background: #fff;
      line-height: 1.8;
    }
    .simple-page h1 {
      font-size: 26px;
      margin-bottom: 20px;
    }
    .simple-page a.button {
      display: inline-block;
      padding: 12px 20px;
      margin-top: 20px;
      background: #8b2f1c;
      color: #fff;
      text-decoration: none;
      border-radius: 6px;
    }
  </style>
</head>
<body>
<div id="wrap">
  <div class="simple-page">
    ${body}
    <p><a class="button" href="/">トップへ戻る</a></p>
  </div>
</div>
</body>
</html>`;
}

fs.mkdirSync(OUT, { recursive: true });

fs.writeFileSync(
  path.join(OUT, "products.html"),
  page("商品一覧", `
    <h1>商品一覧</h1>
    <p>商品一覧ページです。</p>
    <p>現在、自前カート準備中です。ご注文はLINE公式ミニアプリからお願いします。</p>
    <p><a class="button" href="https://line.isoya-commerce.com">LINE注文ページへ</a></p>
  `),
  "utf8"
);

fs.writeFileSync(
  path.join(OUT, "cart.html"),
  page("カート", `
    <h1>カート</h1>
    <p>現在、自前カート準備中です。</p>
    <p><a class="button" href="https://line.isoya-commerce.com">LINE注文ページへ</a></p>
  `),
  "utf8"
);

fs.writeFileSync(
  path.join(OUT, "company.html"),
  page("磯屋について", `
    <h1>磯屋について</h1>
    <p>手造りえびせんべい 磯屋の紹介ページです。</p>
    <p>あとでMakeShopの会社紹介ページから本文を移植します。</p>
  `),
  "utf8"
);

fs.writeFileSync(
  path.join(OUT, "info.html"),
  page("ご利用案内", `
    <h1>ご利用案内</h1>
    <p>送料・お支払い・返品についての案内ページです。</p>
    <p>あとでMakeShopのご利用案内から本文を移植します。</p>
  `),
  "utf8"
);

fs.writeFileSync(
  path.join(OUT, "privacy.html"),
  page("プライバシーポリシー", `
    <h1>プライバシーポリシー</h1>
    <p>個人情報の取り扱いについて記載するページです。</p>
    <p>あとで現在のMakeShopページから文章を移植します。</p>
  `),
  "utf8"
);

fs.writeFileSync(
  path.join(OUT, "law.html"),
  page("特定商取引法に基づく表記", `
    <h1>特定商取引法に基づく表記</h1>
    <p>販売業者、所在地、連絡先、販売価格、送料、返品条件などを記載するページです。</p>
    <p>あとで現在のMakeShopページから文章を移植します。</p>
  `),
  "utf8"
);

console.log("created basic pages");
