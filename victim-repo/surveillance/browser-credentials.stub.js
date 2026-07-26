"use strict";

/**
 * credential-theft.stub.js -- BİLİNÇLİ OLARAK ÇALIŞMAYAN İSKELET
 * ===================================================================
 * RAPORDAKİ KARŞILIĞI: "pow" payload'ının tarayıcı kimlik bilgisi hırsızlığı
 * bölümü -- Chrome/Brave/Edge/Opera/Yandex'in kayıtlı şifrelerini ve
 * kayıtlı kredi kartlarını çalan kısım.
 *
 * GERÇEK VAKADA NE OLUYORDU (yalnızca anlatım amaçlı -- ATT&CK T1555.003):
 *   Chromium tabanlı tarayıcılar, kayıtlı şifreleri "Login Data" adlı bir
 *   SQLite veritabanında, işletim sistemine özel bir anahtarla şifreleyip
 *   saklar. Kötü amaçlı yazılım bu şifreleme mekanizmasını SIFIRDAN icat
 *   etmiyor -- Chromium'un kendi "os_crypt" mantığını yeniden uyguluyor:
 *     - Windows : Local State dosyasındaki os_crypt.encrypted_key AES
 *                 anahtarı, Windows'un kendi DPAPI'si (CryptUnprotectData)
 *                 ile çözülür, sonra bu anahtarla Login Data'daki şifreler
 *                 AES-GCM ile çözülür.
 *     - macOS   : "security find-generic-password -ga <label>" ile Keychain'den
 *                 parola çekilir, PBKDF2(..., b"saltysalt", 16, 1003, SHA1) ile
 *                 anahtar türetilir, AES-CBC ile çözülür.
 *     - Linux   : secretstorage üzerinden "Safe Storage" parolası çekilir,
 *                 PBKDF2(..., b"saltysalt", 16, 1) ile anahtar türetilir,
 *                 AES-CBC ile çözülür.
 *   Aynı yöntemle "Web Data" veritabanındaki credit_cards tablosu da
 *   hedefleniyordu.
 *
 * NEDEN BURADA YAZILMADI:
 *   Bu, rapordaki TEK bileşen içinde "doğrudan silaha dönüştürülebilir"
 *   niteliği en yüksek olan kısımdır: çalışan bir sürümü, hangi makinede
 *   çalıştırılırsa çalıştırılsın GERÇEK tarayıcı profillerindeki GERÇEK
 *   şifreleri ve kredi kartlarını çözebilir -- demo/gerçek ayrımı koddan
 *   anlaşılmaz. Bu yüzden bilinçli olarak, gerçek tarayıcı profil
 *   yollarına dokunan hiçbir kod YAZILMADI.
 *
 * SUNUMDA NASIL KULLANILIR:
 *   Bu dosyayı açıp yukarıdaki tabloyu/mantığı slayt üzerinden anlatın.
 *   İsterseniz Chromium'un os_crypt.cc kaynak kodunu (herkese açık, resmi
 *   Chromium deposunda) referans olarak gösterebilirsiniz -- mekanizma
 *   gizli değil, halka açık bir mühendislik detayı; burada eksik olan
 *   sadece BU DEPODA çalışan bir uygulamasının bulunmamasıdır.
 */

function stealChromiumPasswords(_browserProfilePath) {
  throw new Error(
    "Bu fonksiyon bilinçli olarak boş bırakıldı -- bkz. dosya başındaki yorum ve " +
      "raporun 'pow' bölümü / Konuşma Metni'ndeki DPAPI/PBKDF2 açıklaması."
  );
}

module.exports = { stealChromiumPasswords };
