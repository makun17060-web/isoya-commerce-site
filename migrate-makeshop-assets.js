// migrate-makeshop-assets.js
// MakeShopデザインバックアップから画像URLを抽出して、
// public_migrated/images/makeshop/ に保存し、HTML/CSS/JS/TXT内のURLを置換するスクリプト

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// ===== 設定ここから =====

// MakeShopバックアップを入れたフォルダ名
const INPUT_DIR = path.join(__dirname, "makeshop_backup");

// 変換後の出力先
const OUTPUT_DIR = path.join(__dirname, "public_migrated");

// 画像の保存先
const ASSET_DIR = path.join(OUTPUT_DIR, "images", "makeshop");

// MakeShopで使っていたショップURL
// /images/original_design_default/... や /design/makun17060/... をダウンロードするために使う
// wwwありで表示しているなら https://www.isoya-commerce.com に変更
const SITE_ORIGIN = "https://isoya-commerce.com";

// 置換対象ファイル
const TARGET_EXTS = [".html", ".css", ".js", ".txt"];

// ダウンロード対象の相対パス
const RELATIVE_ASSET_PREFIXES = [
  "/images/original_design_default/",
  "/design/makun17060/"
];

// ===== 設定ここまで =====

const urlMap = new Map();

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function walk(dir) {
  const results = [];

  if (!fs.existsSync(dir)) {
    throw new Error(`フォルダがありません: ${dir}`);
  }

  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      results.push(...walk(full));
    } else {
      results.push(full);
    }
  }

  return results;
}

function copyDir(src, dest) {
  ensureDir(dest);

  for (const item of fs.readdirSync(src)) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      ensureDir(path.dirname(destPath));
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function normalizeUrl(url) {
  if (url.startsWith("//")) return "https:" + url;
  return url;
}

function isTargetFile(file) {
  return TARGET_EXTS.includes(path.extname(file).toLowerCase());
}

function cleanMatchedUrl(url) {
  return url
    .replace(/&amp;/g, "&")
    .replace(/[;,]+$/g, "")
    .trim();
}

function getExtFromUrl(url) {
  const clean = url.split("?")[0].split("#")[0];
  const ext = path.extname(clean).toLowerCase();

  if (ext && ext.length <= 6) return ext;

  return ".bin";
}

function safeBaseName(url) {
  const clean = url.split("?")[0].split("#")[0];
  const base = path.basename(clean);

  if (!base || base === "/" || base === "." || base === "..") {
    return "asset" + getExtFromUrl(url);
  }

  return base.replace(/[^\w.\-ぁ-んァ-ン一-龥]/g, "_");
}

function makeLocalName(downloadUrl) {
  const hash = crypto
    .createHash("md5")
    .update(downloadUrl)
    .digest("hex")
    .slice(0, 8);

  return `${hash}-${safeBaseName(downloadUrl)}`;
}

function addUrl(originalTextUrl, downloadUrl) {
  const normalizedDownloadUrl = normalizeUrl(downloadUrl);
  const localName = makeLocalName(normalizedDownloadUrl);
  const localPath = `/images/makeshop/${localName}`;

  if (!urlMap.has(originalTextUrl)) {
    urlMap.set(originalTextUrl, {
      originalTextUrl,
      downloadUrl: normalizedDownloadUrl,
      localPath,
      localName
    });
  }
}

async function downloadFile(url, savePath) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 MakeShopMigrationScript"
    }
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(savePath, buffer);
}

function collectUrlsFromText(text) {
  // 1. gigaplus.makeshop.jp の絶対URL
  const gigaplusRegex =
    /(?:https?:)?\/\/gigaplus\.makeshop\.jp\/[^\s"'()<>]+/g;

  const gigaplusMatches = text.match(gigaplusRegex) || [];

  for (const raw of gigaplusMatches) {
    const cleaned = cleanMatchedUrl(raw);
    addUrl(raw, cleaned);
  }

  // 2. MakeShop標準画像の相対パス
  // 例: /images/original_design_default/samplesource/3/xxx.png
  // 例: /design/makun17060/companytitle.gif
  const relativeRegex =
    /\/(?:images\/original_design_default|design\/makun17060)\/[^\s"'()<>]+/g;

  const relativeMatches = text.match(relativeRegex) || [];

  for (const raw of relativeMatches) {
    const cleaned = cleanMatchedUrl(raw);

    const shouldAdd = RELATIVE_ASSET_PREFIXES.some(prefix =>
      cleaned.startsWith(prefix)
    );

    if (!shouldAdd) continue;

    const downloadUrl = SITE_ORIGIN.replace(/\/$/, "") + cleaned;
    addUrl(raw, downloadUrl);
  }
}

async function main() {
  console.log("=== MakeShop asset migration start ===");
  console.log(`INPUT_DIR : ${INPUT_DIR}`);
  console.log(`OUTPUT_DIR: ${OUTPUT_DIR}`);

  if (!fs.existsSync(INPUT_DIR)) {
    console.error("");
    console.error("makeshop_backup フォルダが見つかりません。");
    console.error("次のような構成にしてください。");
    console.error("");
    console.error("project/");
    console.error("  migrate-makeshop-assets.js");
    console.error("  makeshop_backup/");
    console.error("    design_mainpage.txt");
    console.error("    design_topmenu.txt");
    console.error("    m_sys_common.txt");
    console.error("");
    process.exit(1);
  }

  // 出力先を作り直し
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  }

  ensureDir(OUTPUT_DIR);
  ensureDir(ASSET_DIR);

  // まずバックアップ全体をコピー
  copyDir(INPUT_DIR, OUTPUT_DIR);

  const allFiles = walk(OUTPUT_DIR);
  const targetFiles = allFiles.filter(isTargetFile);

  console.log(`Target files: ${targetFiles.length}`);

  // 文字化け対策：
  // MakeShopのtxtがEUC-JPの場合でも、URLはASCIIなので latin1 で読む。
  // これにより日本語部分のバイトを壊しにくい。
  for (const file of targetFiles) {
    const text = fs.readFileSync(file, "latin1");
    collectUrlsFromText(text);
  }

  console.log(`Found ${urlMap.size} MakeShop asset URLs`);

  if (urlMap.size === 0) {
    console.log("");
    console.log("画像URLが見つかりませんでした。");
    console.log("makeshop_backup の場所が違うか、ファイル内にURLが無い可能性があります。");
    console.log("");
  }

  // ダウンロード
  let successCount = 0;
  let failCount = 0;

  for (const info of urlMap.values()) {
    const savePath = path.join(ASSET_DIR, info.localName);

    if (fs.existsSync(savePath)) {
      console.log(`skip: ${info.localName}`);
      successCount++;
      continue;
    }

    try {
      console.log(`download: ${info.downloadUrl}`);
      await downloadFile(info.downloadUrl, savePath);
      successCount++;
    } catch (err) {
      failCount++;
      console.error(`ERROR: ${info.downloadUrl}`);
      console.error(`       ${err.message}`);
    }
  }

  // URL置換
  for (const file of targetFiles) {
    let text = fs.readFileSync(file, "latin1");

    for (const info of urlMap.values()) {
      // 元の文字列そのものを置換
      text = text.split(info.originalTextUrl).join(info.localPath);

      // //gigaplus... と https://gigaplus... の揺れ対策
      if (info.originalTextUrl.startsWith("//")) {
        text = text
          .split("https:" + info.originalTextUrl)
          .join(info.localPath);
      }
    }

    fs.writeFileSync(file, text, "latin1");
  }

  // マップ出力
  const list = [...urlMap.values()].map(v => ({
    original_in_file: v.originalTextUrl,
    download_url: v.downloadUrl,
    local: v.localPath,
    file: v.localName
  }));

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "asset-map.json"),
    JSON.stringify(list, null, 2),
    "utf8"
  );

  // 失敗リスト
  const failed = list.filter(item => {
    const savePath = path.join(ASSET_DIR, item.file);
    return !fs.existsSync(savePath);
  });

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "asset-download-failed.json"),
    JSON.stringify(failed, null, 2),
    "utf8"
  );

  console.log("");
  console.log("=== done ===");
  console.log(`success: ${successCount}`);
  console.log(`failed : ${failCount}`);
  console.log(`Output : ${OUTPUT_DIR}`);
  console.log("");
  console.log("次に確認するファイル:");
  console.log(`- ${path.join(OUTPUT_DIR, "asset-map.json")}`);
  console.log(`- ${path.join(OUTPUT_DIR, "asset-download-failed.json")}`);
}

main().catch(err => {
  console.error("");
  console.error("Fatal error:");
  console.error(err);
  process.exit(1);
});