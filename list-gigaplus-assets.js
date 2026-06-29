const fs = require("fs");
const path = require("path");

const assetMapPath = path.join(__dirname, "public_migrated", "asset-map.json");

if (!fs.existsSync(assetMapPath)) {
  console.error("public_migrated/asset-map.json が見つかりません");
  process.exit(1);
}

const assets = JSON.parse(fs.readFileSync(assetMapPath, "utf8"));

const gigaplusAssets = assets.filter(item =>
  (item.original_in_file || "").includes("gigaplus.makeshop.jp") ||
  (item.download_url || "").includes("gigaplus.makeshop.jp")
);

function csvEscape(value) {
  const s = String(value ?? "");
  return `"${s.replace(/"/g, '""')}"`;
}

const rows = [
  ["no", "file", "local", "original_in_file", "download_url"],
  ...gigaplusAssets.map((item, index) => [
    index + 1,
    item.file,
    item.local,
    item.original_in_file,
    item.download_url
  ])
];

const csv = rows.map(row => row.map(csvEscape).join(",")).join("\n");

fs.writeFileSync(
  path.join(__dirname, "gigaplus-assets.csv"),
  csv,
  "utf8"
);

const txt = gigaplusAssets
  .map((item, index) => {
    return `${index + 1}. ${item.file}
   local: ${item.local}
   original: ${item.original_in_file}`;
  })
  .join("\n\n");

fs.writeFileSync(
  path.join(__dirname, "gigaplus-assets.txt"),
  txt,
  "utf8"
);

console.log(`gigaplus assets: ${gigaplusAssets.length}`);
console.log("created: gigaplus-assets.csv");
console.log("created: gigaplus-assets.txt");