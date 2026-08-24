import test from "node:test";
import assert from "node:assert/strict";
import { calculateShipping, normalizeCart, priceCart, validateCustomer } from "../lib/commerce.mjs";

test("カートの同一商品をまとめる", () => {
  assert.deepEqual(normalizeCart([{ id: "a", quantity: 2 }, { id: "a", quantity: 1 }]), [{ id: "a", quantity: 3 }]);
});

test("価格と在庫は商品マスターで検証する", () => {
  const lines = priceCart([{ id: "a", quantity: 2 }], [{ id: "a", name: "商品", price: 370, stock: 2 }]);
  assert.equal(lines[0].unitAmount, 370);
  assert.throws(() => priceCart([{ id: "a", quantity: 3 }], [{ id: "a", name: "商品", price: 370, stock: 2 }]), /在庫/);
});

test("混載時は大きい配送サイズを使う", () => {
  const data = {
    rules: [
      { shippingGroup: "akasha6", minQty: 1, maxQty: 5, size: 60 },
      { shippingGroup: "original_set", minQty: 1, maxQty: 1, size: 80 }
    ],
    rates: [{ region: "関東", prefectures: "東京都 神奈川県", fees: { "80": 1210 } }]
  };
  assert.deepEqual(calculateShipping([{ id: "loose", quantity: 2 }, { id: "original-set-2000", quantity: 1 }], data, "東京都"), { size: 80, amount: 1210, region: "関東" });
});

test("配送先を検証する", () => {
  const customer = validateCustomer({ name: "磯屋 太郎", email: "taro@example.com", phone: "090-1234-5678", postalCode: "123-4567", prefecture: "東京都", city: "千代田区", address1: "1-1" });
  assert.equal(customer.postalCode, "1234567");
  assert.throws(() => validateCustomer({}), /お名前/);
});
