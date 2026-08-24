import { createServer } from "node:http";
import { createReadStream, existsSync, mkdirSync, appendFileSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { createHmac, timingSafeEqual } from "node:crypto";
import { fileURLToPath } from "node:url";
import {
  calculateShipping,
  isHidden,
  normalizeCart,
  priceCart,
  validateCustomer
} from "./lib/commerce.mjs";

const ROOT = fileURLToPath(new URL(".", import.meta.url));
const PUBLIC = resolve(ROOT, "public");
const PORT = Number(process.env.PORT || 3000);
const PRODUCT_API = "https://line.isoya-commerce.com/api/products";
const SHIPPING_API = "https://line.isoya-commerce.com/api/public-shipping";
const processedEvents = new Set();
const MIME = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif",
  ".svg": "image/svg+xml", ".ico": "image/x-icon", ".webp": "image/webp"
};

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(data));
}

async function readBody(req, limit = 64_000) {
  const chunks = [];
  let length = 0;
  for await (const chunk of req) {
    length += chunk.length;
    if (length > limit) throw new Error("リクエストが大きすぎます。");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "isoya-stripe-store/1.0" },
    signal: AbortSignal.timeout(10_000)
  });
  if (!response.ok) throw new Error("商品・送料情報を取得できませんでした。");
  const data = await response.json();
  if (!data?.ok) throw new Error("商品・送料情報を取得できませんでした。");
  return data;
}

function flatten(value, prefix = "", output = new URLSearchParams()) {
  if (value === undefined || value === null || value === "") return output;
  if (Array.isArray(value)) {
    value.forEach((item, index) => flatten(item, `${prefix}[${index}]`, output));
  } else if (typeof value === "object") {
    Object.entries(value).forEach(([key, item]) => flatten(item, prefix ? `${prefix}[${key}]` : key, output));
  } else {
    output.append(prefix, String(value));
  }
  return output;
}

async function stripeRequest(path, payload, method = "POST") {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error("Stripeの秘密鍵が設定されていません。");
  const response = await fetch(`https://api.stripe.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${secret}`,
      ...(method === "POST" ? { "Content-Type": "application/x-www-form-urlencoded" } : {})
    },
    body: method === "POST" ? flatten(payload).toString() : undefined,
    signal: AbortSignal.timeout(15_000)
  });
  const data = await response.json();
  if (!response.ok) {
    console.error("Stripe API error", data?.error?.type, data?.error?.code);
    throw new Error(data?.error?.message || "決済画面を開始できませんでした。");
  }
  return data;
}

function baseUrl(req) {
  if (process.env.APP_BASE_URL) return process.env.APP_BASE_URL.replace(/\/$/, "");
  const proto = req.headers["x-forwarded-proto"] || "http";
  return `${proto}://${req.headers.host}`;
}

async function createCheckout(req, res) {
  const raw = await readBody(req);
  const body = JSON.parse(raw.toString("utf8") || "{}");
  if (body.acceptedTerms !== true) throw new Error("利用条件への同意が必要です。");

  const cart = normalizeCart(body.cart);
  const customer = validateCustomer(body.customer);
  const [catalog, shippingData] = await Promise.all([fetchJson(PRODUCT_API), fetchJson(SHIPPING_API)]);
  const lines = priceCart(cart, catalog.products || []);
  const shipping = calculateShipping(lines, shippingData, customer.prefecture);

  const stripeCustomer = await stripeRequest("/v1/customers", {
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    shipping: {
      name: customer.name,
      phone: customer.phone,
      address: {
        country: "JP", postal_code: customer.postalCode, state: customer.prefecture,
        city: customer.city, line1: customer.address1, line2: customer.address2
      }
    },
    metadata: { source: "isoya_web_store" }
  });

  const checkoutLines = lines.map((line) => ({
    price_data: {
      currency: "jpy", unit_amount: line.unitAmount, tax_behavior: "inclusive",
      product_data: {
        name: line.name,
        description: line.description,
        ...(line.image ? { images: [line.image] } : {}),
        metadata: { product_id: line.id }
      }
    },
    quantity: line.quantity
  }));
  checkoutLines.push({
    price_data: {
      currency: "jpy", unit_amount: shipping.amount, tax_behavior: "inclusive",
      product_data: { name: `送料（ヤマト運輸 ${shipping.size}サイズ・${shipping.region}）` }
    },
    quantity: 1
  });

  const orderSummary = lines.map((line) => `${line.id}:${line.quantity}`).join(",").slice(0, 500);
  const session = await stripeRequest("/v1/checkout/sessions", {
    mode: "payment",
    locale: "ja",
    customer: stripeCustomer.id,
    line_items: checkoutLines,
    success_url: `${baseUrl(req)}/success.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl(req)}/cart.html?cancelled=1`,
    submit_type: "pay",
    metadata: {
      source: "isoya_web_store", order_items: orderSummary,
      shipping_prefecture: customer.prefecture, shipping_size: shipping.size
    },
    payment_intent_data: { metadata: { source: "isoya_web_store", order_items: orderSummary } }
  });
  sendJson(res, 200, { ok: true, url: session.url });
}

function verifyStripeSignature(raw, signature) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const parts = signature.split(",").map((part) => part.split("=", 2));
  const timestamp = Number(parts.find(([key]) => key === "t")?.[1]);
  if (!timestamp || Math.abs(Date.now() / 1000 - timestamp) > 300) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}.${raw.toString("utf8")}`).digest("hex");
  return parts.filter(([key]) => key === "v1").some(([, received]) =>
    expected.length === received.length && timingSafeEqual(Buffer.from(expected), Buffer.from(received))
  );
}

async function fulfillOrder(event) {
  if (processedEvents.has(event.id)) return;
  const session = event.data.object;
  if (session.payment_status !== "paid") return;
  const customer = session.customer ? await stripeRequest(`/v1/customers/${encodeURIComponent(session.customer)}`, null, "GET") : null;
  const order = {
    eventId: event.id, eventType: event.type, receivedAt: new Date().toISOString(),
    sessionId: session.id, paymentIntentId: session.payment_intent,
    amountTotal: session.amount_total, currency: session.currency,
    customer: customer ? { id: customer.id, name: customer.name, email: customer.email, phone: customer.phone, shipping: customer.shipping } : null,
    metadata: session.metadata || {}
  };

  if (process.env.ORDER_WEBHOOK_URL) {
    const response = await fetch(process.env.ORDER_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(process.env.ORDER_WEBHOOK_SECRET ? { Authorization: `Bearer ${process.env.ORDER_WEBHOOK_SECRET}` } : {}) },
      body: JSON.stringify(order), signal: AbortSignal.timeout(10_000)
    });
    if (!response.ok) throw new Error(`受注転送に失敗しました: HTTP ${response.status}`);
  } else {
    const dataDir = resolve(ROOT, "data");
    mkdirSync(dataDir, { recursive: true });
    appendFileSync(join(dataDir, "orders.jsonl"), `${JSON.stringify(order)}\n`, { encoding: "utf8" });
  }
  processedEvents.add(event.id);
}

async function webhook(req, res) {
  const raw = await readBody(req, 256_000);
  if (!verifyStripeSignature(raw, req.headers["stripe-signature"])) return sendJson(res, 400, { error: "署名を確認できません。" });
  const event = JSON.parse(raw.toString("utf8"));
  if (["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(event.type)) {
    await fulfillOrder(event);
  }
  sendJson(res, 200, { received: true });
}

async function catalog(res) {
  const data = await fetchJson(PRODUCT_API);
  const products = (data.products || []).filter((product) => !isHidden(product)).map((product) => ({
    id: product.id, name: product.name, price: product.price, stock: product.stock,
    volume: product.volume, desc: product.desc, ingredients: product.ingredients,
    best_before: product.best_before,
    image: String(product.image || "").replace(/^http:\/\//i, "https://")
  }));
  sendJson(res, 200, { ok: true, products });
}

async function checkoutStatus(url, res) {
  const id = url.searchParams.get("id") || "";
  if (!/^cs_(test_|live_)?[A-Za-z0-9_]+$/.test(id)) return sendJson(res, 400, { error: "決済IDが正しくありません。" });
  const session = await stripeRequest(`/v1/checkout/sessions/${encodeURIComponent(id)}`, null, "GET");
  if (session.metadata?.source !== "isoya_web_store") return sendJson(res, 404, { error: "決済情報を確認できませんでした。" });
  sendJson(res, 200, { ok: true, paymentStatus: session.payment_status, customerName: session.customer_details?.name || "", amountTotal: session.amount_total, currency: session.currency });
}

function serveStatic(url, res) {
  const pathname = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const file = resolve(PUBLIC, `.${normalize(pathname)}`);
  if (!file.startsWith(`${PUBLIC}\\`) && file !== PUBLIC) return sendJson(res, 403, { error: "Forbidden" });
  if (!existsSync(file)) return sendJson(res, 404, { error: "Not found" });
  res.writeHead(200, { "Content-Type": MIME[extname(file).toLowerCase()] || "application/octet-stream", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "strict-origin-when-cross-origin" });
  createReadStream(file).pipe(res);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  try {
    if (req.method === "GET" && url.pathname === "/api/health") return sendJson(res, 200, { ok: true });
    if (req.method === "GET" && url.pathname === "/api/catalog") return await catalog(res);
    if (req.method === "POST" && url.pathname === "/api/create-checkout-session") return await createCheckout(req, res);
    if (req.method === "GET" && url.pathname === "/api/checkout-session") return await checkoutStatus(url, res);
    if (req.method === "POST" && url.pathname === "/api/stripe-webhook") return await webhook(req, res);
    if (req.method === "GET" || req.method === "HEAD") return serveStatic(url, res);
    sendJson(res, 405, { error: "Method not allowed" });
  } catch (error) {
    console.error(error);
    sendJson(res, 400, { error: error instanceof Error ? error.message : "処理に失敗しました。" });
  }
});

server.listen(PORT, "0.0.0.0", () => console.log(`磯屋ストア: http://localhost:${PORT}`));
