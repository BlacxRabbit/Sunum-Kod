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
    { id: 1, title: "3+1 Modern Daire", type: "Satılık", rooms: "3+1", m2: 145, district: "Merkez Mahallesi", price: "Fiyat için iletişime geçin" },
    { id: 2, title: "Bahçeli Müstakil Ev", type: "Satılık", rooms: "5+2", m2: 260, district: "Yeşiltepe", price: "Fiyat için iletişime geçin" },
    { id: 3, title: "Merkezi Ofis Katı", type: "Kiralık", rooms: "Plan Ofis", m2: 90, district: "İş Merkezi", price: "Fiyat için iletişime geçin" },
    { id: 4, title: "Deniz Manzaralı Rezidans", type: "Satılık", rooms: "2+1", m2: 110, district: "Sahil Mahallesi", price: "Fiyat için iletişime geçin" },
    { id: 5, title: "Öğrenciye Uygun Stüdyo", type: "Kiralık", rooms: "1+0", m2: 45, district: "Üniversite Yakını", price: "Fiyat için iletişime geçin" },
    { id: 6, title: "Bahçe Katı Dubleks", type: "Satılık", rooms: "4+1", m2: 190, district: "Bahçelievler", price: "Fiyat için iletişime geçin" },
  ]);
});

app.listen(PORT, () => {
  console.log(`[demo] Decoy web app hazır: http://localhost:${PORT}/`);
});
