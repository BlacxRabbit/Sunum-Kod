"use strict";

/**
 * screenshot.stub.js -- BİLİNÇLİ OLARAK ÇALIŞMAYAN İSKELET
 * ===========================================================
 * RAPORDAKİ KARŞILIĞI: `screenshot-desktop` (ekran görüntüsü alma) +
 * `sharp` (görüntüyü sızdırmadan önce küçültme/sıkıştırma) paket ikilisi.
 *
 * GERÇEK VAKADA NE OLUYORDU:
 *   npm ile `screenshot-desktop` ve `sharp` sessizce kuruluyor, periyodik
 *   olarak kullanıcının ekranının görüntüsü alınıyor, `sharp` ile boyutu
 *   küçültülüp C2'ye yükleniyordu -- amaç hem bant genişliğini azaltmak
 *   hem de büyük dosya yüklemelerinin oluşturabileceği anomali tespitini
 *   azaltmaktı.
 *
 * NEDEN BURADA YAZILMADI:
 *   Gerçek çalışan bir ekran yakalama döngüsü, demo bağlamından bağımsız
 *   olarak kullanıcının GERÇEK ekranını (üzerinde gerçek e-postalar,
 *   şifreler, belgeler olabilir) yakalar. Bu depo hiçbir gerçek kişisel
 *   veriye dokunmamalı; bu yüzden bilinçli olarak atlandı.
 *
 * SUNUMDA NASIL KULLANILIR:
 *   Bu dosyayı açıp anlatın; `captureScreenshot()` kasıtlı olarak hata
 *   fırlatır.
 */

function captureScreenshot(_outputPath) {
  throw new Error(
    "Bu fonksiyon bilinçli olarak boş bırakıldı -- gerçek vakada screenshot-desktop + " +
      "sharp paket ikilisi kullanılıyordu."
  );
}

module.exports = { captureScreenshot };
