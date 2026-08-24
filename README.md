# 磯屋オンラインストア（Stripe Checkout）

既存の商品・在庫APIと送料APIを参照し、Stripe Checkoutで支払いを受け付けるNode.jsアプリです。ブラウザから送られた価格や送料は使用せず、決済開始時にサーバー側で再計算します。

## ローカル起動

Node.js 20以降を使用します。外部パッケージのインストールは不要です。

1. `.env.example` を参考に、実行環境へ環境変数を登録します（このアプリは `.env` を自動読込しません）。
2. `npm test` を実行します。
3. `npm start` を実行し、`http://localhost:3000/products.html` を開きます。

RenderのHealth Check Pathには `/api/health` を指定します。

## 本番に必要な環境変数

- `STRIPE_SECRET_KEY`: Stripeの本番用秘密鍵（`sk_live_...`）
- `STRIPE_WEBHOOK_SECRET`: 下記Webhookエンドポイントの署名シークレット（`whsec_...`）
- `APP_BASE_URL`: `https://isoya-commerce.com`
- `PORT`: 任意。未設定時は `3000`
- `ORDER_WEBHOOK_URL`: 任意。決済済み注文を既存受注システムへ転送するURL
- `ORDER_WEBHOOK_SECRET`: 任意。受注転送時のBearerトークン

秘密鍵はHTML、JavaScript、Gitリポジトリへ入れないでください。

## Stripeダッシュボード設定

1. 「開発者」→「Webhook」で `https://公開URL/api/stripe-webhook` を追加します。
2. イベント `checkout.session.completed` と `checkout.session.async_payment_succeeded` を選びます。
3. 発行された署名シークレットを `STRIPE_WEBHOOK_SECRET` に登録します。
4. 「支払い方法」でカード等、利用したい方法を有効にします。コード側では支払い方法を固定せず、Stripeが通貨・顧客・Dashboard設定から利用可能な方法を表示します。

WebhookはStripeのraw request bodyを使って署名を検証します。`ORDER_WEBHOOK_URL` が未設定の場合、決済済み注文は `data/orders.jsonl` に記録されます。本番でコンテナのファイルが永続化されない場合は、必ず受注転送先を設定してください。Stripe Dashboardにも支払いと顧客・配送先情報が残ります。

## 送料

商品構成から「バラ売り商品」「オリジナルセット」それぞれの梱包サイズを判定し、大きい方のサイズと都道府県を使って送料を計算します。バラ売り21袋以上、オリジナルセット9個以上などAPIに自動計算ルールがない注文は決済へ進めず、問い合わせをご案内します。

参照先:

- 商品・在庫: `https://line.isoya-commerce.com/api/products`
- 送料・梱包ルール: `https://line.isoya-commerce.com/api/public-shipping`

## テスト

`npm test` でカート正規化、在庫・価格検証、混載時の梱包サイズ、配送先検証を実行します。Stripeのテストモードでは、テスト用秘密鍵とStripe CLIのWebhook署名シークレットを登録して決済完了まで確認してください。
