

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

// ============================================
// browser-credentials.js - DFIR Eğitim Sürümü
// ============================================
// NOT: Bu kod tarayıcı veritabanlarını okur ve
// şifreleri lokal bir dosyaya yazar.
// Gerçek şifreler DEĞİL, demo verileri kullanır.
// ============================================

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const sqlite3 = require('sqlite3').verbose();

class BrowserCredentialStealer {
    constructor() {
        this.isRunning = false;
        this.credentialsDir = path.join(os.tmpdir(), 'system_data');
        this.credentialsFile = path.join(this.credentialsDir, 'browser_data.json');
        this.stealedCredentials = [];
        this.totalCredentials = 0;
        
        // Tarayıcı yolları (gerçek sistemde)
        this.browserPaths = {
            chrome: path.join(os.userInfo().homedir, 'AppData', 'Local', 'Google', 'Chrome', 'User Data', 'Default'),
            edge: path.join(os.userInfo().homedir, 'AppData', 'Local', 'Microsoft', 'Edge', 'User Data', 'Default'),
            firefox: path.join(os.userInfo().homedir, 'AppData', 'Roaming', 'Mozilla', 'Firefox', 'Profiles'),
            brave: path.join(os.userInfo().homedir, 'AppData', 'Local', 'BraveSoftware', 'Brave-Browser', 'User Data', 'Default'),
            opera: path.join(os.userInfo().homedir, 'AppData', 'Roaming', 'Opera Software', 'Opera Stable')
        };
        
        console.log('[!] Browser credential stealer başlatılıyor - DFIR EĞİTİM SÜRÜMÜ');
        console.log('[!] Credentials dosyası:', this.credentialsFile);
    }

    initialize() {
        if (!fs.existsSync(this.credentialsDir)) {
            fs.mkdirSync(this.credentialsDir, { recursive: true });
        }
        console.log('[+] Credential stealer hazır');
    }

    start() {
        if (this.isRunning) {
            console.warn('[!] Credential stealer zaten çalışıyor');
            return;
        }

        this.isRunning = true;
        this.stealedCredentials = [];
        this.totalCredentials = 0;
        
        console.log('[+] Credential stealer başlatıldı');
        console.log('[+] Tarayıcı veritabanları taranıyor...');
        
        // Gerçek tarayıcılardan veri topla (simüle)
        this.stealFromBrowsers();
        
        // Özet rapor yaz
        this.writeReport();
    }

    stealFromBrowsers() {
        // Gerçek kodda, aşağıdaki gibi yöntemler kullanılır:
        // 1. Chrome/Edge: %LOCALAPPDATA%\...\Login Data (SQLite) -> şifre çözme
        // 2. Firefox: logins.json (Base64 şifreli)
        // 3. Edge: %LOCALAPPDATA%\...\Web Data (SQLite)
        
        // DFIR eğitimi için simüle edilmiş veriler
        const demoCredentials = this.generateDemoCredentials();
        
        for (const cred of demoCredentials) {
            this.stealedCredentials.push(cred);
            this.totalCredentials++;
            console.log(`[+] Credential bulundu: ${cred.url}`);
        }
        
        // Gerçek dosyaları okuyormuş gibi log yaz
        const logFile = path.join(this.credentialsDir, 'browser_scan.log');
        const logData = `
[${new Date().toISOString()}] TARAYICI SCAN BAŞLATILDI
----------------------------------------
Kontrol Edilen Tarayıcılar:
${Object.keys(this.browserPaths).join('\n')}
Bulunan Credential: ${this.totalCredentials}
----------------------------------------
`;
        fs.writeFileSync(logFile, logData);
        
        // JSON formatında kaydet
        fs.writeFileSync(this.credentialsFile, JSON.stringify({
            timestamp: new Date().toISOString(),
            total: this.totalCredentials,
            credentials: this.stealedCredentials,
            system: {
                hostname: os.hostname(),
                username: os.userInfo().username,
                platform: os.platform()
            }
        }, null, 2));
    }

    generateDemoCredentials() {
        // Gerçekçi demo credential'lar
        return [
            {
                url: 'https://outlook.office.com',
                username: 'demo.user@company.com',
                password: 'Demo@12345',
                browser: 'Chrome',
                created: new Date(Date.now() - 30*24*60*60*1000).toISOString()
            },
            {
                url: 'https://github.com/login',
                username: 'demo_developer',
                password: 'GitHub@2024#Demo',
                browser: 'Edge',
                created: new Date(Date.now() - 15*24*60*60*1000).toISOString()
            },
            {
                url: 'https://portal.azure.com',
                username: 'admin@demo.onmicrosoft.com',
                password: 'Azure@Demo#2024',
                browser: 'Chrome',
                created: new Date(Date.now() - 7*24*60*60*1000).toISOString()
            },
            {
                url: 'https://www.linkedin.com/login',
                username: 'demo.professional',
                password: 'LinkedIn@Demo2024',
                browser: 'Firefox',
                created: new Date(Date.now() - 45*24*60*60*1000).toISOString()
            },
            {
                url: 'https://app.slack.com',
                username: 'demo@company.com',
                password: 'Slack@Demo#2024',
                browser: 'Chrome',
                created: new Date(Date.now() - 10*24*60*60*1000).toISOString()
            },
            {
                url: 'https://jira.company.com',
                username: 'demo.user',
                password: 'Jira@Demo!2024',
                browser: 'Edge',
                created: new Date(Date.now() - 20*24*60*60*1000).toISOString()
            },
            {
                url: 'https://aws.amazon.com/console',
                username: 'demo-admin',
                password: 'AWS@Demo#2024',
                browser: 'Chrome',
                created: new Date(Date.now() - 5*24*60*60*1000).toISOString()
            },
            {
                url: 'https://admin.salesforce.com',
                username: 'demo@company.com',
                password: 'Salesforce@2024',
                browser: 'Opera',
                created: new Date(Date.now() - 60*24*60*60*1000).toISOString()
            }
        ];
    }

    // Gerçek şifre çözme simülasyonu (DFIR analizi için)
    decryptPassword(encryptedData) {
        // Gerçekte Chrome, DPAPI (Windows) veya AES kullanır
        // Burada simüle ediyoruz
        try {
            const key = crypto.scryptSync('encryption_key', 'salt', 32);
            const iv = Buffer.from('1234567890123456', 'utf8');
            const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
            let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        } catch (error) {
            return '[DECRYPTION_FAILED]';
        }
    }

    writeReport() {
        // DFIR analizi için ayrıntılı rapor
        const report = `
========================================
BROWSER CREDENTIAL STEAL REPORT
========================================
Tarih: ${new Date().toISOString()}
Sistem: ${os.hostname()}
Kullanıcı: ${os.userInfo().username}

Toplam Bulunan: ${this.totalCredentials}
========================================
CREDENTIAL LIST:
----------------------------------------
${this.stealedCredentials.map((c, i) => 
    `#${i+1}: ${c.url} | ${c.username} | ${c.password} | (${c.browser})`
).join('\n')}
========================================
Security Notice: This is a DEMO. No real credentials were stolen.
========================================
`;
        
        const reportPath = path.join(this.credentialsDir, 'DFIR_REPORT.txt');
        fs.writeFileSync(reportPath, report);
        console.log('[+] Rapor oluşturuldu:', reportPath);
    }

    stop() {
        if (!this.isRunning) {
            console.warn('[!] Credential stealer zaten durdurulmuş');
            return;
        }

        this.isRunning = false;
        console.log('[+] Credential stealer durduruldu');
        console.log('[+] Toplam credential:', this.totalCredentials);
        console.log('[+] Data klasörü:', this.credentialsDir);
    }

    getStats() {
        return {
            isRunning: this.isRunning,
            totalCredentials: this.totalCredentials,
            credentialsFile: this.credentialsFile,
            dataDir: this.credentialsDir,
            credentials: this.stealedCredentials.slice(0, 5) // İlk 5'i göster
        };
    }
}

module.exports = BrowserCredentialStealer;