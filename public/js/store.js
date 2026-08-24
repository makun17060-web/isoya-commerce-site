const CART_KEY = "isoya_stripe_cart_v1";
const CUSTOMER_KEY = "isoya_checkout_customer_v1";
const PREFECTURES = ["北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県","茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県","新潟県","富山県","石川県","福井県","山梨県","長野県","岐阜県","静岡県","愛知県","三重県","滋賀県","京都府","大阪府","兵庫県","奈良県","和歌山県","鳥取県","島根県","岡山県","広島県","山口県","徳島県","香川県","愛媛県","高知県","福岡県","佐賀県","長崎県","熊本県","大分県","宮崎県","鹿児島県","沖縄県"];
const yen = (value) => new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(Number(value) || 0);
const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);

function loadCart() { try { const value = JSON.parse(localStorage.getItem(CART_KEY) || "[]"); return Array.isArray(value) ? value : []; } catch { return []; } }
function saveCart(cart) { localStorage.setItem(CART_KEY, JSON.stringify(cart.filter((item) => item.quantity > 0))); updateCartCount(); }
function updateCartCount() { const count = loadCart().reduce((sum, item) => sum + Number(item.quantity || 0), 0); document.querySelectorAll(".cart-count").forEach((element) => element.textContent = String(count)); }
function addToCart(id, quantity) { const cart = loadCart(); const current = cart.find((item) => item.id === id); if (current) current.quantity = Math.min(20, current.quantity + quantity); else cart.push({ id, quantity }); saveCart(cart); }

async function api(url, options) { const response = await fetch(url, options); const data = await response.json().catch(() => ({})); if (!response.ok || data.ok === false) throw new Error(data.error || "通信に失敗しました。"); return data; }

async function productsPage() {
  const grid = document.getElementById("store-products"); const message = document.getElementById("store-message");
  try {
    const { products } = await api("/api/catalog"); grid.innerHTML = "";
    products.forEach((product) => {
      const card = document.createElement("article"); card.className = "store-product"; const unavailable = Number(product.stock) <= 0;
      card.innerHTML = `<div class="store-image">${product.image ? `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy">` : `<span>手造りえびせんべい 磯屋</span>`}</div><div class="store-product-body"><p class="product-volume">${escapeHtml(product.volume || "")}</p><h2>${escapeHtml(product.name)}</h2><p class="product-description">${escapeHtml(product.desc || "")}</p>${product.ingredients ? `<details><summary>原材料・賞味期限</summary><p>${escapeHtml(product.ingredients)}</p><p>${escapeHtml(product.best_before || "")}</p></details>` : ""}<div class="buy-row"><strong>${yen(product.price)}<small>（税込）</small></strong><label>数量<input type="number" min="1" max="${Math.min(20, Number(product.stock) || 20)}" value="1" inputmode="numeric" ${unavailable ? "disabled" : ""}></label></div><button class="add-cart-button" type="button" ${unavailable ? "disabled" : ""}>${unavailable ? "在庫なし" : "カートに入れる"}</button></div>`;
      card.querySelector("button").addEventListener("click", (event) => { const quantity = Math.max(1, Math.min(20, Number(card.querySelector("input").value) || 1)); addToCart(product.id, quantity); event.currentTarget.textContent = "カートに追加しました ✓"; setTimeout(() => event.currentTarget.textContent = "カートに入れる", 1200); });
      grid.appendChild(card);
    });
    message.hidden = true;
  } catch (error) { message.textContent = error.message; message.classList.add("error"); }
}

async function cartPage() {
  if (new URLSearchParams(location.search).has("cancelled")) document.getElementById("cancel-notice").hidden = false;
  const container = document.getElementById("cart-items"); const subtotalElement = document.getElementById("cart-subtotal"); const form = document.getElementById("checkout-form"); const button = document.getElementById("checkout-button"); const errorBox = document.getElementById("checkout-error");
  const select = form.elements.prefecture; PREFECTURES.forEach((name) => select.add(new Option(name, name)));
  try { const saved = JSON.parse(localStorage.getItem(CUSTOMER_KEY) || "{}"); Object.entries(saved).forEach(([key, value]) => { if (form.elements[key]) form.elements[key].value = value; }); } catch {}
  let products = []; try { ({ products } = await api("/api/catalog")); } catch (error) { errorBox.textContent = error.message; errorBox.hidden = false; }
  const byId = new Map(products.map((product) => [product.id, product]));
  function render() {
    const cart = loadCart().filter((item) => byId.has(item.id)); saveCart(cart); container.innerHTML = ""; let subtotal = 0;
    cart.forEach((item) => { const product = byId.get(item.id); subtotal += Number(product.price) * item.quantity; const row = document.createElement("div"); row.className = "cart-row"; row.innerHTML = `<div class="cart-thumb">${product.image ? `<img src="${escapeHtml(product.image)}" alt="">` : ""}</div><div class="cart-product"><strong>${escapeHtml(product.name)}</strong><span>${yen(product.price)} / 個</span></div><label class="cart-quantity">数量<input type="number" min="1" max="20" value="${item.quantity}" inputmode="numeric"></label><strong class="cart-line-total">${yen(Number(product.price) * item.quantity)}</strong><button class="remove-button" type="button" aria-label="${escapeHtml(product.name)}を削除">削除</button>`;
      row.querySelector("input").addEventListener("change", (event) => { item.quantity = Math.max(1, Math.min(20, Number(event.target.value) || 1)); saveCart(cart); render(); }); row.querySelector("button").addEventListener("click", () => { saveCart(cart.filter((candidate) => candidate.id !== item.id)); render(); }); container.appendChild(row); });
    if (!cart.length) container.innerHTML = `<div class="empty-cart"><p>カートは空です。</p><a class="checkout-button" href="/products.html">商品を選ぶ</a></div>`;
    subtotalElement.textContent = yen(subtotal); button.disabled = cart.length === 0;
  }
  render();
  form.addEventListener("submit", async (event) => {
    event.preventDefault(); errorBox.hidden = true; if (!form.reportValidity()) return; const values = Object.fromEntries(new FormData(form)); const customer = { name: values.name, email: values.email, phone: values.phone, postalCode: values.postalCode, prefecture: values.prefecture, city: values.city, address1: values.address1, address2: values.address2 };
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer)); button.disabled = true; button.textContent = "送料を計算しています…";
    try { const result = await api("/api/create-checkout-session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cart: loadCart(), customer, acceptedTerms: values.acceptedTerms === "on" }) }); location.assign(result.url); }
    catch (error) { errorBox.textContent = error.message; errorBox.hidden = false; errorBox.scrollIntoView({ behavior: "smooth", block: "center" }); button.disabled = false; button.textContent = "送料を計算して決済へ進む"; }
  });
}

async function successPage() {
  const box = document.getElementById("payment-status"); const id = new URLSearchParams(location.search).get("session_id"); if (!id) { box.textContent = "決済情報を確認できませんでした。"; box.classList.add("error"); return; }
  try { const status = await api(`/api/checkout-session?id=${encodeURIComponent(id)}`); if (status.paymentStatus === "paid") { box.textContent = `${status.customerName ? `${status.customerName} 様　` : ""}お支払い ${yen(status.amountTotal)} を確認しました。`; localStorage.removeItem(CART_KEY); } else { box.textContent = "お支払い手続きは受付済みです。入金確認後に発送準備を始めます。"; } } catch (error) { box.textContent = error.message; box.classList.add("error"); }
}

updateCartCount(); const page = document.body.dataset.page; if (page === "products") productsPage(); if (page === "cart") cartPage(); if (page === "success") successPage();
