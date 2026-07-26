"use strict";

/**
 * server.js
 * ---------
 * RAPORDAKİ KARŞILIĞI: "http://localhost:5173/" adresinde çalışan, gerçek
 * görünümlü gayrimenkul ilan sitesi (decoy). Raporda belirtildiği gibi
 * sayfa başlıkları dışında çoğu içerik placeholder'dı -- bu demo da aynı
 * şekilde bilinçli olarak minimal tutuldu. Bu dosyanın tek amacı, saldırı
 * zinciri arka planda çalışırken kurbana "her şey normal" hissi veren
 * ekranı canlandırmaktır; kendisi zararlı hiçbir şey içermez.
 */

const express = require("express");
const path = require("path");

const app = express();
const PORT = 5173;

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/listings", (_req, res) => {
  // Rapordaki gibi: gerçek görünen ama içi placeholder veri.
  res.json([
    { id: 1, title: "3+1 Modern Daire", price: "Fiyat için iletişime geçin", city: "Örnek Şehir" },
    { id: 2, title: "Bahçeli Müstakil Ev", price: "Fiyat için iletişime geçin", city: "Örnek Şehir" },
    { id: 3, title: "Merkezi Ofis Katı", price: "Fiyat için iletişime geçin", city: "Örnek Şehir" },
  ]);
});

app.listen(PORT, () => {
  console.log(`[demo] Decoy web app hazır: http://localhost:${PORT}/`);
});
