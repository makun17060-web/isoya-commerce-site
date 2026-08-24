const MAX_LINE_QUANTITY = 20;
const MAX_TOTAL_QUANTITY = 40;

export function normalizeCart(rawCart) {
  if (!Array.isArray(rawCart) || rawCart.length === 0) {
    throw new Error("カートが空です。");
  }

  const quantities = new Map();
  for (const raw of rawCart) {
    const id = String(raw?.id || "").trim();
    const quantity = Number(raw?.quantity);
    if (!id || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_LINE_QUANTITY) {
      throw new Error("商品の数量が正しくありません。");
    }
    quantities.set(id, (quantities.get(id) || 0) + quantity);
  }

  const cart = [...quantities].map(([id, quantity]) => ({ id, quantity }));
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (totalQuantity > MAX_TOTAL_QUANTITY || cart.some((item) => item.quantity > MAX_LINE_QUANTITY)) {
    throw new Error("一度に購入できる数量を超えています。LINEからお問い合わせください。");
  }
  return cart;
}

export function isHidden(product) {
  return product?.hidden === true || String(product?.hidden).toLowerCase() === "true" || Number(product?.hidden) === 1;
}

export function priceCart(cart, products) {
  const byId = new Map(products.map((product) => [String(product.id), product]));
  return cart.map((item) => {
    const product = byId.get(item.id);
    if (!product || isHidden(product)) throw new Error("現在購入できない商品が含まれています。");

    const price = Number(product.price);
    const stock = Number(product.stock);
    if (!Number.isInteger(price) || price < 1) throw new Error("商品価格を確認できませんでした。");
    if (Number.isFinite(stock) && item.quantity > stock) {
      throw new Error(`${product.name}の在庫は${stock}個です。`);
    }

    return {
      id: item.id,
      name: String(product.name || item.id).slice(0, 120),
      description: [product.volume, product.desc].filter(Boolean).join(" / ").slice(0, 200),
      image: normalizeImage(product.image),
      unitAmount: price,
      quantity: item.quantity
    };
  });
}

export function normalizeImage(value) {
  const image = String(value || "").trim();
  if (!image) return "";
  return image.replace(/^http:\/\//i, "https://");
}

function sizeForQuantity(rules, group, quantity) {
  if (quantity === 0) return 0;
  const rule = rules.find((candidate) =>
    candidate.shippingGroup === group &&
    quantity >= Number(candidate.minQty) &&
    (candidate.maxQty === null || quantity <= Number(candidate.maxQty))
  );
  if (!rule) throw new Error("この数量は送料を自動計算できません。LINEからお問い合わせください。");
  return Number(rule.size);
}

export function calculateShipping(lines, shippingData, prefecture) {
  const looseQuantity = lines
    .filter((line) => line.id !== "original-set-2000")
    .reduce((sum, line) => sum + line.quantity, 0);
  const setQuantity = lines
    .filter((line) => line.id === "original-set-2000")
    .reduce((sum, line) => sum + line.quantity, 0);

  const looseSize = sizeForQuantity(shippingData.rules, "akasha6", looseQuantity);
  const setSize = sizeForQuantity(shippingData.rules, "original_set", setQuantity);
  const size = Math.max(looseSize, setSize);

  const rate = shippingData.rates.find((candidate) =>
    String(candidate.prefectures || "").split(/\s+/).includes(prefecture)
  );
  const amount = Number(rate?.fees?.[String(size)]);
  if (!rate || !Number.isInteger(amount) || amount < 0) {
    throw new Error("お届け先の送料を計算できませんでした。");
  }
  return { size, amount, region: String(rate.region) };
}

export function validateCustomer(raw) {
  const customer = {
    name: String(raw?.name || "").trim(),
    email: String(raw?.email || "").trim().toLowerCase(),
    phone: String(raw?.phone || "").replace(/[^0-9+]/g, ""),
    postalCode: String(raw?.postalCode || "").replace(/\D/g, ""),
    prefecture: String(raw?.prefecture || "").trim(),
    city: String(raw?.city || "").trim(),
    address1: String(raw?.address1 || "").trim(),
    address2: String(raw?.address2 || "").trim()
  };
  if (!customer.name || customer.name.length > 80) throw new Error("お名前を入力してください。");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) throw new Error("メールアドレスを確認してください。");
  if (customer.phone.length < 10 || customer.phone.length > 15) throw new Error("電話番号を確認してください。");
  if (!/^\d{7}$/.test(customer.postalCode)) throw new Error("郵便番号は7桁で入力してください。");
  if (!PREFECTURES.includes(customer.prefecture)) throw new Error("都道府県を選択してください。");
  if (!customer.city || !customer.address1) throw new Error("市区町村・番地を入力してください。");
  if ([customer.city, customer.address1, customer.address2].some((value) => value.length > 100)) {
    throw new Error("住所が長すぎます。");
  }
  return customer;
}

export const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
];
