"use strict";

/**
 * keylogger.stub.js -- BİLİNÇLİ OLARAK ÇALIŞMAYAN İSKELET
 * =========================================================
 * RAPORDAKİ KARŞILIĞI: "way" payload'ının keylogger + pano hırsızı kısmı,
 * ve daha sonra eklenen "node-global-key-listener" tabanlı ikinci katman.
 *
 * GERÇEK VAKADA NE OLUYORDU (yalnızca anlatım amaçlı):
 *   - Python tarafında `pyWinhook` ile Windows'ta global bir klavye hook'u
 *     kuruluyor, her tuş vuruşu global bir `e_buf` arabelleğine yazılıyordu.
 *   - `pyperclip` ile pano (clipboard) içeriği periyodik olarak okunuyordu.
 *   - Daha sonraki bir aşamada `node-global-key-listener` npm paketiyle
 *     (bin/WinKeyServer.exe adlı native bir ikili dosya kurarak) AYNI
 *     işlev JS tarafında da tekrarlanıyordu -- muhtemelen yedeklilik için.
 *   - Biriken veri, RAT protokolünün "3" numaralı komutuyla C2'ye
 *     sızdırılıyordu (bkz. rapordaki "way" bölümü).
 *
 * NEDEN BURADA YAZILMADI:
 *   Çalışan bir global klavye/pano yakalayıcı, demo senaryosundan bağımsız
 *   olarak GERÇEK bir gözetim/casus yazılım yeteneğidir -- kimin, hangi
 *   makinede çalıştırdığından bağımsız olarak gerçek tuş vuruşlarını ve
 *   gerçek pano içeriğini yakalar. Bu, "zararsız demo" sınırının dışına
 *   çıkan tek kategoridir, bu yüzden bilinçli olarak atlandı.
 *
 * SUNUMDA NASIL KULLANILIR:
 *   Bu dosyayı ekranda açıp yukarıdaki yorumları okuyarak anlatın; kod
 *   çalıştırmaya gerek yok. `startKeylogger()` çağrılırsa kasıtlı olarak
 *   hata fırlatır.
 */

function startKeylogger(_onKeyEvent) {
  throw new Error(
    "Bu fonksiyon bilinçli olarak boş bırakıldı -- bkz. dosya başındaki yorum. " +
      "Gerçek vakada burada pyWinhook / node-global-key-listener kullanılıyordu."
  );
}

function readClipboardBuffer() {
  throw new Error(
    "Bu fonksiyon bilinçli olarak boş bırakıldı -- gerçek vakada pyperclip ile pano " +
      "periyodik olarak okunuyordu."
  );
}

module.exports = { startKeylogger, readClipboardBuffer };
