// victim-repo/scripts/surveillance/browser-credentials.js
// DFIR Eğitim Sürümü – Gerçek şifreleri okumaz, demo veri üretir.

const fs = require('fs');
const path = require('path');
const os = require('os');

class BrowserStealer {
    constructor() {
        this.isRunning = false;
        this.credentialsDir = path.join(os.tmpdir(), 'system_data');
        this.credentialsFile = path.join(this.credentialsDir, 'browser_data.json');
        this.total = 0;
        console.log('[!] Browser credential stealer başlatılıyor – DFIR EĞİTİM SÜRÜMÜ');
        console.log('[!] Veri dosyası:', this.credentialsFile);
    }

    initialize() {
        if (!fs.existsSync(this.credentialsDir)) {
            fs.mkdirSync(this.credentialsDir, { recursive: true });
        }
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.initialize();
        console.log('[+] Browser stealer başlatıldı');

        // Demo credential listesi oluştur
        const demoData = this.generateDemoCredentials();
        this.total = demoData.length;

        const output = {
            timestamp: new Date().toISOString(),
            total: this.total,
            system: { hostname: os.hostname(), username: os.userInfo().username },
            credentials: demoData
        };

        fs.writeFileSync(this.credentialsFile, JSON.stringify(output, null, 2));
        console.log(`[+] ${this.total} adet demo credential kaydedildi.`);

        // Ek log dosyası
        const logPath = path.join(this.credentialsDir, 'DFIR_REPORT.txt');
        const report = `
========================================
BROWSER CREDENTIAL STEAL REPORT
========================================
Tarih: ${new Date().toISOString()}
Sistem: ${os.hostname()}
Kullanıcı: ${os.userInfo().username}
Toplam: ${this.total}
----------------------------------------
${demoData.map((c, i) => `#${i+1}: ${c.url} | ${c.username} | ${c.password} | (${c.browser})`).join('\n')}
========================================
`;
        fs.writeFileSync(logPath, report);
        console.log('[+] Rapor oluşturuldu:', logPath);
    }

    generateDemoCredentials() {
        return [
            { url: 'https://outlook.office.com', username: 'demo.user@company.com', password: 'Demo@12345', browser: 'Chrome' },
            { url: 'https://github.com/login', username: 'demo_developer', password: 'GitHub@2024#Demo', browser: 'Edge' },
            { url: 'https://portal.azure.com', username: 'admin@demo.onmicrosoft.com', password: 'Azure@Demo#2024', browser: 'Chrome' },
            { url: 'https://www.linkedin.com/login', username: 'demo.professional', password: 'LinkedIn@Demo2024', browser: 'Firefox' },
            { url: 'https://app.slack.com', username: 'demo@company.com', password: 'Slack@Demo#2024', browser: 'Chrome' },
            { url: 'https://jira.company.com', username: 'demo.user', password: 'Jira@Demo!2024', browser: 'Edge' },
            { url: 'https://aws.amazon.com/console', username: 'demo-admin', password: 'AWS@Demo#2024', browser: 'Chrome' },
            { url: 'https://admin.salesforce.com', username: 'demo@company.com', password: 'Salesforce@2024', browser: 'Opera' }
        ];
    }

    stop() {
        if (!this.isRunning) return;
        this.isRunning = false;
        console.log('[+] Browser stealer durduruldu');
        console.log('[+] Toplam credential:', this.total);
    }

    getStats() {
        return { isRunning: this.isRunning, totalCredentials: this.total, file: this.credentialsFile };
    }
}

module.exports = BrowserStealer;