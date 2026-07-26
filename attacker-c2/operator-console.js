"use strict";
// operator-console.js
// Sunumu yapan kisinin "saldirgan operator" rolunu canlandirdigi basit
// komut satiri araci. server.js'in /api/operator/* uc noktalarini kullanir.
// Rapordaki operator panelinin bu depodaki en minimal karsiligidir.

const readline = require("readline");

const BASE = "http://127.0.0.1:4000";

function printHelp() {
  console.log(`
Komutlar:
  list                    - baglanan kurbanlari listele
  send <uid> <action>     - kurbana whitelist'li bir aksiyon gonder
                            (ping | getSysInfo | listDemoFiles)
  help                    - bu mesaji goster
  exit                    - cik
`);
}

async function listVictims() {
  const res = await fetch(`${BASE}/api/operator/victims`);
  const victims = await res.json();
  if (victims.length === 0) {
    console.log("Henuz baglanan kurban yok. victim-repo'da 'DEMO_ACTIVE=1 npm install' calistirdiniz mi?");
    return;
  }
  console.table(victims);
}

async function sendCommand(uid, action) {
  const res = await fetch(`${BASE}/api/operator/command`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid, action }),
  });
  const data = await res.json();
  console.log(data.ok ? "Komut gonderildi. Sonuc bu terminalde degil, server.js konsolunda gorunecek." : `Hata: ${data.error}`);
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: "operator> " });

console.log("Contagious Interview demo -- operator konsolu. 'help' yazarak komutlari gorun.");
rl.prompt();

rl.on("line", async (line) => {
  const [cmd, ...args] = line.trim().split(/\s+/);
  try {
    if (cmd === "list") await listVictims();
    else if (cmd === "send") await sendCommand(args[0], args[1]);
    else if (cmd === "help") printHelp();
    else if (cmd === "exit") process.exit(0);
    else if (cmd) console.log("Bilinmeyen komut. 'help' yazin.");
  } catch (err) {
    console.log(`Hata: ${err.message} -- C2 sunucusu (npm start) calisiyor mu?`);
  }
  rl.prompt();
});
