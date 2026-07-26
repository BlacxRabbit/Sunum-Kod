"use strict";

/**
 * config.js
 * ---------
 * Demo genelinde paylaşılan ayarlar. Rapordaki gerçek vakada bu değerler
 * (C2 adresi, port, kampanya uid'si) obfuscated kod içine sabit olarak
 * gömülüydü (hardcoded uid=63ef6b5d8b400d4c97f4468d62b52fa2, t=12).
 * Biz aynı fikri koruyoruz ama adresi 127.0.0.1'e (kendi mock C2'miz)
 * sabitliyoruz — bu demo hiçbir zaman gerçek internete çıkmamalı.
 */

module.exports = {
  // Gerçek vakada bu iki farklı gerçek IP'ydi (216.126.237.99 ve 88.218.0.78).
  // Burada bilinçli olarak sadece localhost kullanılıyor.
  c2HttpBase: process.env.DEMO_C2_HTTP || "http://127.0.0.1:4000",
  c2SocketUrl: process.env.DEMO_C2_SOCKET || "http://127.0.0.1:4000",

  // Rapordaki "uid" alanının karşılığı: bu demo VM'ini C2 panelinde
  // ayırt etmek için kullanılan sabit bir demo kimliği.
  demoCampaignId: "demo-contagious-interview-egitim",

  // filescanner.js'in taradığı kök dizin. Gerçek vakada tüm sürücüler
  // (C:, D:, ...) taranıyordu; burada bilinçli olarak sadece depo içindeki
  // sahte veri klasörüyle sınırlandırıldı. Gerçek kişisel klasörlere
  // ASLA yönlendirmeyin.
  scanRootDir: require("path").join(__dirname, "..", "demo-victim-data"),

  // Postinstall zincirinin kazara tetiklenmesini önlemek için gereken bayrak.
  requiredEnvFlag: "DEMO_ACTIVE",
};
