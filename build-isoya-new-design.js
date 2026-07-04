const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PUBLIC = path.join(ROOT, "public");
const CSS_DIR = path.join(PUBLIC, "css");

const LINE_ORDER_URL = "https://line.isoya-commerce.com";
const LINE_FRIEND_URL = "https://lin.ee/QJ61Cb3";

// 既に移植済みの画像を使う
const ASSET = {
  logo: "/images/makeshop/0858c51d-isoya9.png",
  payment: "/images/makeshop/68c2cbbc-20231115.png",
  lineBanner: "/images/makeshop/ccf5e2a3-t_subBnr03.jpg",
  trialBanner: "/images/makeshop/50763bcf-banner_buy_now_lower_2200.png",
  aboutBanner: "/images/makeshop/37b4ebf9-pc_bnr1.jpg",
  setBanner: "/images/makeshop/b747ea1f-baibainew.png",
  hero: "/images/hero-isoya.jpg"
  originalSet: "/images/products/original-set.png"
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function write(file, content) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, content, "utf8");
}

function backupPublic() {
  if (!fs.existsSync(PUBLIC)) return;

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join(ROOT, "backup-before-new-design-" + stamp);

  fs.cpSync(PUBLIC, backupDir, { recursive: true });
  console.log("backup:", backupDir);
}

function layout(title, description, body) {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>${title}｜手造りえびせんべい 磯屋</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${description}">
  <link rel="stylesheet" href="/css/isoya-new.css">
</head>
<body>

<header class="site-header">
  <div class="header-inner">
    <a class="brand" href="/">
      <img src="${ASSET.logo}" alt="手造りえびせんべい 磯屋">
    </a>

    <nav class="global-nav" aria-label="主要メニュー">
      <a href="/products.html">商品紹介</a>
      <a href="/company.html">磯屋について</a>
      <a href="/info.html">ご利用案内</a>
      <a href="/law.html">特商法表記</a>
    </nav>

    <a class="header-cta" href="${LINE_ORDER_URL}">LINEで注文</a>
  </div>
</header>

${body}

<footer class="site-footer">
  <div class="footer-inner">
    <div>
      <p class="footer-logo">手造りえびせんべい 磯屋</p>
      <p>香ばしさと手造りの味を、まっすぐお届けします。</p>
    </div>
    <div class="footer-links">
      <a href="/products.html">商品紹介</a>
      <a href="/info.html">ご利用案内</a>
      <a href="/privacy.html">プライバシーポリシー</a>
      <a href="/law.html">特定商取引法に基づく表記</a>
    </div>
  </div>
  <p class="copyright">© 手造りえびせんべい 磯屋</p>
</footer>

<div class="fixed-order">
  <a href="${LINE_ORDER_URL}">LINEで注文する</a>
</div>

</body>
</html>`;
}

const css = `
:root {
  --bg: #fff8ef;
  --paper: #ffffff;
  --ink: #2d2119;
  --muted: #76675d;
  --brown: #7c341f;
  --brown-dark: #552414;
  --orange: #d96b2b;
  --line: #06c755;
  --border: #ead8c8;
  --shadow: 0 16px 40px rgba(85, 36, 20, 0.12);
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Hiragino Kaku Gothic ProN", "Yu Gothic", Meiryo, sans-serif;
  color: var(--ink);
  background:
    radial-gradient(circle at top left, rgba(217, 107, 43, 0.12), transparent 35%),
    linear-gradient(180deg, #fffdf8 0%, var(--bg) 100%);
  line-height: 1.8;
}

a {
  color: inherit;
}

img {
  max-width: 100%;
  height: auto;
  vertical-align: middle;
}

.site-header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(255, 253, 248, 0.94);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
}

.header-inner {
  max-width: 1120px;
  margin: 0 auto;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.brand img {
  width: 180px;
  display: block;
}

.global-nav {
  flex: 1;
  display: flex;
  justify-content: center;
  gap: 24px;
  font-weight: 700;
  font-size: 14px;
}

.global-nav a,
.footer-links a {
  text-decoration: none;
}

.global-nav a:hover,
.footer-links a:hover {
  color: var(--brown);
}

.header-cta,
.btn,
.line-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 20px;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 800;
  letter-spacing: 0.02em;
  transition: transform 0.18s ease, opacity 0.18s ease;
}

.header-cta,
.line-btn {
  background: var(--line);
  color: #fff;
}

.btn {
  background: var(--brown);
  color: #fff;
}

.btn.sub {
  background: #fff;
  color: var(--brown);
  border: 1px solid var(--brown);
}

.header-cta:hover,
.btn:hover,
.line-btn:hover {
  transform: translateY(-1px);
  opacity: 0.9;
}

.hero {
  max-width: 1120px;
  margin: 0 auto;
  padding: 64px 20px 44px;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 44px;
  align-items: center;
}

.hero-label {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 999px;
  background: #fff0df;
  color: var(--brown);
  font-weight: 800;
  font-size: 13px;
  margin-bottom: 18px;
}

.hero h1 {
  margin: 0;
  font-size: clamp(34px, 5vw, 58px);
  line-height: 1.18;
  letter-spacing: 0.02em;
}

.hero-lead {
  margin: 22px 0 28px;
  color: var(--muted);
  font-size: 17px;
}

.hero-actions,
.section-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.hero-card {
  background: var(--paper);
  border: 1px solid var(--border);
  border-radius: 28px;
  padding: 18px;
  box-shadow: var(--shadow);
}

.hero-card img {
  border-radius: 20px;
}

.hero-note {
  margin: 12px 4px 0;
  color: var(--muted);
  font-size: 14px;
}

.section {
  max-width: 1120px;
  margin: 0 auto;
  padding: 54px 20px;
}

.section-head {
  text-align: center;
  margin-bottom: 30px;
}

.section-head .en {
  color: var(--orange);
  font-weight: 900;
  letter-spacing: 0.14em;
  font-size: 12px;
}

.section h2 {
  margin: 6px 0 12px;
  font-size: clamp(26px, 4vw, 40px);
  line-height: 1.3;
}

.section-head p {
  color: var(--muted);
  margin: 0 auto;
  max-width: 700px;
}

.feature-grid,
.product-grid,
.flow-grid {
  display: grid;
  gap: 18px;
}

.feature-grid {
  grid-template-columns: repeat(3, 1fr);
}

.product-grid {
  grid-template-columns: repeat(3, 1fr);
}

.flow-grid {
  grid-template-columns: repeat(4, 1fr);
}

.card,
.product-card,
.flow-card,
.page-card {
  background: var(--paper);
  border: 1px solid var(--border);
  border-radius: 22px;
  padding: 24px;
  box-shadow: 0 10px 28px rgba(85, 36, 20, 0.07);
}

.card h3,
.product-card h3,
.flow-card h3 {
  margin: 0 0 10px;
  font-size: 20px;
}

.card p,
.product-card p,
.flow-card p {
  margin: 0;
  color: var(--muted);
}

.product-card {
  display: flex;
  flex-direction: column;
}

.product-image {
  aspect-ratio: 4 / 3;
  background: linear-gradient(135deg, #fff2df, #ffffff);
  border: 1px solid var(--border);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-card .price {
  margin-top: 12px;
  color: var(--brown);
  font-weight: 900;
}

.product-card .btn {
  margin-top: auto;
  width: 100%;
}

.wide-banner {
  background: var(--paper);
  border: 1px solid var(--border);
  border-radius: 28px;
  padding: 18px;
  box-shadow: var(--shadow);
  overflow: hidden;
}

.wide-banner img {
  border-radius: 20px;
  width: 100%;
}

.split {
  display: grid;
  grid-template-columns: 0.95fr 1.05fr;
  gap: 30px;
  align-items: center;
}

.split-text p {
  color: var(--muted);
}

.notice {
  padding: 18px 20px;
  border-radius: 18px;
  background: #fff2df;
  border: 1px solid #f3cfac;
  color: var(--brown-dark);
}

.page-main {
  max-width: 980px;
  margin: 0 auto;
  padding: 54px 20px;
}

.page-title {
  text-align: center;
  margin-bottom: 28px;
}

.page-title h1 {
  margin: 0 0 10px;
  font-size: clamp(30px, 5vw, 46px);
}

.page-title p {
  color: var(--muted);
  margin: 0;
}

.page-card {
  margin-bottom: 18px;
}

.table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 18px;
  overflow: hidden;
}

.table th,
.table td {
  border-bottom: 1px solid var(--border);
  padding: 14px;
  text-align: left;
  vertical-align: top;
}

.table th {
  width: 30%;
  background: #fff6eb;
  color: var(--brown);
}

.site-footer {
  margin-top: 50px;
  background: var(--brown-dark);
  color: #fff;
  padding: 42px 20px 92px;
}

.footer-inner {
  max-width: 1120px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  gap: 30px;
}

.footer-logo {
  font-size: 22px;
  font-weight: 900;
  margin: 0 0 8px;
}

.site-footer p {
  color: rgba(255,255,255,0.78);
}

.footer-links {
  display: grid;
  gap: 8px;
}

.footer-links a {
  color: rgba(255,255,255,0.86);
}

.copyright {
  max-width: 1120px;
  margin: 28px auto 0;
  font-size: 13px;
}

.fixed-order {
  display: none;
}

@media (max-width: 820px) {
  .header-inner {
    gap: 12px;
    padding: 10px 14px;
  }

  .brand img {
    width: 140px;
  }

  .global-nav {
    display: none;
  }

  .header-cta {
    margin-left: auto;
    min-height: 40px;
    padding: 0 14px;
    font-size: 13px;
  }

  .hero {
    grid-template-columns: 1fr;
    padding: 36px 16px 28px;
    gap: 26px;
  }

  .hero h1 {
    font-size: 36px;
  }

  .section {
    padding: 40px 16px;
  }

  .feature-grid,
  .product-grid,
  .flow-grid,
  .split {
    grid-template-columns: 1fr;
  }

  .footer-inner {
    flex-direction: column;
  }

  .site-footer {
    padding-bottom: 100px;
  }

  .fixed-order {
    display: block;
    position: fixed;
    left: 14px;
    right: 14px;
    bottom: 14px;
    z-index: 50;
  }

  .fixed-order a {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 54px;
    border-radius: 999px;
    background: var(--line);
    color: #fff;
    font-weight: 900;
    text-decoration: none;
    box-shadow: 0 12px 26px rgba(0,0,0,0.22);
  }

  .table th,
  .table td {
    display: block;
    width: 100%;
  }
}
`;

const indexBody = `
<main>
  <section class="hero">
    <div>
      <span class="hero-label">手造りえびせんべい 磯屋</span>
      <h1>香ばしく、やさしい。<br>手造りのえびせんべい。</h1>
      <p class="hero-lead">
        磯屋は、えびの風味と素材の味を大切にした手造りえびせんべいのお店です。
        ご家庭用にも、贈り物にも、毎日のお茶うけにも。
      </p>
      <div class="hero-actions">
        <a class="line-btn" href="${LINE_ORDER_URL}">LINEミニアプリで注文</a>
        <a class="btn sub" href="/products.html">商品を見る</a>
      </div>
    </div>

    <div class="hero-card">
      <img src="${ASSET.hero}" alt="手造りえびせんべい 磯屋について">
      <p class="hero-note">初めての方は、まず商品紹介をご覧ください。</p>
    </div>
  </section>

  <section class="section">
    <div class="section-head">
      <p class="en">FEATURE</p>
      <h2>磯屋のこだわり</h2>
      <p>派手さよりも、毎日食べたくなる味。素材焼き加減香ばしさを大切にしています。</p>
    </div>

    <div class="feature-grid">
      <article class="card">
        <h3>手造りの味</h3>
        <p>一つひとつの工程を大切にし、香ばしく食べやすい味に仕上げています。</p>
      </article>
      <article class="card">
        <h3>贈り物にも</h3>
        <p>ご家庭用だけでなく、ちょっとした手土産や贈答にも使いやすい商品です。</p>
      </article>
      <article class="card">
        <h3>LINEで簡単注文</h3>
        <p>スマホから商品を選び、LINEミニアプリでスムーズにご注文いただけます。</p>
      </article>
    </div>
  </section>

  <section class="section">
    <div class="section-head">
      <p class="en">PRODUCTS</p>
      <h2>おすすめ商品</h2>
      <p>まずは人気商品やお試しセットから。詳しい商品紹介ページもご用意しています。</p>
    </div>

    <div class="product-grid">
      <article class="product-card">
        <div class="product-image">
          <img src="${ASSET.trialBanner}" alt="お試しセット">
        </div>
        <h3>お試しセット</h3>
        <p>磯屋の味を初めて楽しむ方におすすめのセットです。</p>
        <p class="price">詳しくは商品紹介へ</p>
        <a class="btn" href="/products.html#trial-set">商品を見る</a>
      </article>

      <article class="product-card">
        <div class="product-image">
          <img src="${ASSET.setBanner}" alt="商品一覧">
        </div>
        <h3>定番えびせん</h3>
        <p>香ばしさと食べやすさを大切にした、磯屋の定番商品です。</p>
        <p class="price">LINE注文で確認</p>
        <a class="btn" href="/products.html#standard">商品を見る</a>
      </article>

      <article class="product-card">
        <div class="product-image">
          <img src="${ASSET.lineBanner}" alt="LINE注文">
        </div>
        <h3>LINEで注文</h3>
        <p>注文再注文はLINEミニアプリから。スマホで簡単にご利用いただけます。</p>
        <p class="price">注文ページへ</p>
        <a class="line-btn" href="${LINE_ORDER_URL}">LINEで注文</a>
      </article>
    </div>
  </section>

  <section class="section">
    <div class="split">
      <div class="wide-banner">
        <img src="${ASSET.payment}" alt="お支払い方法">
      </div>
      <div class="split-text">
        <p class="en">ORDER</p>
        <h2>ご注文はLINEミニアプリへ</h2>
        <p>
          商品紹介ページで内容をご確認いただき、ご注文はLINEミニアプリからお願いします。
          住所入力支払い方法選択注文確認まで、スマホで進められます。
        </p>
        <div class="section-actions">
          <a class="line-btn" href="${LINE_ORDER_URL}">LINEミニアプリを開く</a>
          <a class="btn sub" href="${LINE_FRIEND_URL}">LINE友だち追加</a>
        </div>
      </div>
    </div>
  </section>
</main>
`;

const productsBody = `
<main class="page-main">
  <div class="page-title">
    <h1>商品紹介</h1>
    <p>磯屋のえびせんべいをご紹介します。ご注文はLINEミニアプリからお願いします。</p>
  </div>

  <section id="trial-set" class="page-card">
    <div class="split">
      <div class="wide-banner">
        <img src="${ASSET.trialBanner}" alt="お試しセット">
      </div>
      <div>
        <h2>お試しセット</h2>
        <p>
          初めての方におすすめのセットです。磯屋の味を少しずつ楽しみたい方、
          ご家庭用や贈り物前のお試しにも向いています。
        </p>
        <p class="notice">価格内容量はLINE注文ページでご確認ください。</p>
        <a class="line-btn" href="${LINE_ORDER_URL}">LINEで注文する</a>
      </div>
    </div>
  </section>

  <section id="standard" class="section" style="padding-left:0;padding-right:0;">
    <div class="section-head">
      <p class="en">STANDARD</p>
      <h2>定番商品</h2>
      <p>商品写真は今後、実際の商品画像に差し替えていきます。</p>
    </div>

    <div class="product-grid">
      <article class="product-card" id="nori-kaku">
        <div class="product-image"><span>商品画像を差し替え予定</span></div>
        <h3>のり角</h3>
        <p>海苔の香りとえびせんの香ばしさを楽しめる商品です。</p>
        <p class="price">価格はLINEで確認</p>
        <a class="line-btn" href="${LINE_ORDER_URL}">注文ページへ</a>
      </article>

      <article class="product-card" id="ebi-yamato">
        <div class="product-image"><span>商品画像を差し替え予定</span></div>
        <h3>えび大和</h3>
        <p>えびの風味をしっかり感じられる、食べごたえのある商品です。</p>
        <p class="price">価格はLINEで確認</p>
        <a class="line-btn" href="${LINE_ORDER_URL}">注文ページへ</a>
      </article>

      <article class="product-card" id="nori-matsukaze">
        <div class="product-image"><span>商品画像を差し替え予定</span></div>
        <h3>のり松風</h3>
        <p>軽い食感と香ばしさが楽しめる、人気のえびせんべいです。</p>
        <p class="price">価格はLINEで確認</p>
        <a class="line-btn" href="${LINE_ORDER_URL}">注文ページへ</a>
      </article>

      <article class="product-card" id="kusuke">
        <div class="product-image"><span>商品画像を差し替え予定</span></div>
        <h3>久助</h3>
        <p>気軽に楽しめるご家庭用の商品です。毎日のお茶うけにもおすすめです。</p>
        <p class="price">価格はLINEで確認</p>
        <a class="line-btn" href="${LINE_ORDER_URL}">注文ページへ</a>
      </article>

      <article class="product-card" id="gift">
        <div class="product-image"><span>商品画像を差し替え予定</span></div>
        <h3>詰め合わせ贈答</h3>
        <p>ご家庭用から贈り物まで、用途に合わせてお選びいただけます。</p>
        <p class="price">内容はLINEで確認</p>
        <a class="line-btn" href="${LINE_ORDER_URL}">注文ページへ</a>
      </article>

      <article class="product-card" id="line-order">
        <div class="product-image">
          <img src="${ASSET.lineBanner}" alt="LINE注文">
        </div>
        <h3>LINE注文</h3>
        <p>スマホから商品選択注文確認まで進められます。</p>
        <p class="price">注文はこちら</p>
        <a class="line-btn" href="${LINE_ORDER_URL}">LINEで注文</a>
      </article>
    </div>
  </section>
</main>
`;

const companyBody = `
<main class="page-main">
  <div class="page-title">
    <h1>磯屋について</h1>
    <p>手造りえびせんべい 磯屋のご紹介です。</p>
  </div>

  <div class="wide-banner">
    <img src="${ASSET.aboutBanner}" alt="磯屋について">
  </div>

  <section class="page-card">
    <h2>手造りのえびせんべいを、まっすぐに。</h2>
    <p>
      磯屋は、えびの風味と香ばしさを大切にした手造りえびせんべいのお店です。
      派手な見た目よりも、毎日食べたくなる味、贈りたくなる味を目指しています。
    </p>
    <p>
      ご家庭用、手土産、贈答、得意先様向けの商品など、用途に合わせてご利用いただけます。
    </p>
  </section>

  <section class="page-card">
    <h2>ご注文について</h2>
    <p>
      個人のお客様はLINEミニアプリからご注文いただけます。
      商品紹介ページをご確認のうえ、LINE注文ページへお進みください。
    </p>
    <a class="line-btn" href="${LINE_ORDER_URL}">LINEで注文する</a>
  </section>
</main>
`;

const infoBody = `
<main class="page-main">
  <div class="page-title">
    <h1>ご利用案内</h1>
    <p>配送お支払い返品についてのご案内です。</p>
  </div>

  <section class="page-card">
    <h2>ご注文方法</h2>
    <p>商品紹介ページをご覧いただき、ご注文はLINEミニアプリからお願いします。</p>
    <a class="line-btn" href="${LINE_ORDER_URL}">LINE注文ページへ</a>
  </section>

  <section class="page-card">
    <h2>配送について</h2>
    <p>配送方法送料は、ご注文内容やお届け先地域により異なります。詳しくは注文画面でご確認ください。</p>
  </section>

  <section class="page-card">
    <h2>お支払いについて</h2>
    <p>対応しているお支払い方法は、注文画面でご確認ください。</p>
  </section>

  <section class="page-card">
    <h2>返品交換について</h2>
    <p>食品のため、お客様都合による返品交換は原則としてお受けできません。商品不良や誤配送があった場合は、到着後お早めにご連絡ください。</p>
  </section>
</main>
`;

const privacyBody = `
<main class="page-main">
  <div class="page-title">
    <h1>プライバシーポリシー</h1>
    <p>個人情報の取り扱いについて</p>
  </div>

  <section class="page-card">
    <p>
      当店は、ご注文お問い合わせの際に取得した個人情報を、商品の発送、注文確認、
      お問い合わせ対応、サービス改善の目的で利用します。
    </p>
    <p>
      法令に基づく場合を除き、ご本人の同意なく第三者へ個人情報を提供することはありません。
    </p>
    <p class="notice">本番公開前に、実際の運用に合わせて内容を確認してください。</p>
  </section>
</main>
`;

const lawBody = `
<main class="page-main">
  <div class="page-title">
    <h1>特定商取引法に基づく表記</h1>
    <p>販売に関する表示</p>
  </div>

  <section class="page-card">
    <table class="table">
      <tr>
        <th>販売業者</th>
        <td>手造りえびせんべい 磯屋</td>
      </tr>
      <tr>
        <th>運営責任者</th>
        <td>実際の責任者名に差し替えてください</td>
      </tr>
      <tr>
        <th>所在地</th>
        <td>実際の所在地に差し替えてください</td>
      </tr>
      <tr>
        <th>電話番号</th>
        <td>実際の電話番号に差し替えてください</td>
      </tr>
      <tr>
        <th>販売価格</th>
        <td>各商品ページまたは注文画面に表示</td>
      </tr>
      <tr>
        <th>商品代金以外の必要料金</th>
        <td>送料、代引手数料等がかかる場合があります。</td>
      </tr>
      <tr>
        <th>お支払い方法</th>
        <td>注文画面に表示される方法にてお支払いください。</td>
      </tr>
      <tr>
        <th>返品交換</th>
        <td>食品のため、お客様都合による返品交換は原則としてお受けできません。</td>
      </tr>
    </table>
    <p class="notice">MakeShop解約前に、必ず正式な表記へ差し替えてください。</p>
  </section>
</main>
`;

backupPublic();

ensureDir(PUBLIC);
ensureDir(CSS_DIR);

write(path.join(CSS_DIR, "isoya-new.css"), css);

write(
  path.join(PUBLIC, "index.html"),
  layout(
    "公式サイト",
    "手造りえびせんべい 磯屋の公式サイト。商品紹介とLINE注文のご案内。",
    indexBody
  )
);

write(
  path.join(PUBLIC, "products.html"),
  layout(
    "商品紹介",
    "磯屋の商品紹介ページ。お試しセット、定番えびせん、LINE注文のご案内。",
    productsBody
  )
);

write(
  path.join(PUBLIC, "company.html"),
  layout(
    "磯屋について",
    "手造りえびせんべい 磯屋についての紹介ページ。",
    companyBody
  )
);

write(
  path.join(PUBLIC, "info.html"),
  layout(
    "ご利用案内",
    "配送、お支払い、返品についてのご利用案内。",
    infoBody
  )
);

write(
  path.join(PUBLIC, "privacy.html"),
  layout(
    "プライバシーポリシー",
    "個人情報の取り扱いについて。",
    privacyBody
  )
);

write(
  path.join(PUBLIC, "law.html"),
  layout(
    "特定商取引法に基づく表記",
    "特定商取引法に基づく表記。",
    lawBody
  )
);

console.log("created new Isoya design");
console.log("files:");
console.log("- public/index.html");
console.log("- public/products.html");
console.log("- public/company.html");
console.log("- public/info.html");
console.log("- public/privacy.html");
console.log("- public/law.html");
console.log("- public/css/isoya-new.css");
