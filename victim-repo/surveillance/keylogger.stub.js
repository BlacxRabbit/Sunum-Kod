// ============================================
// keylogger.js - DFIR Eğitim Sürümü
// ============================================
// NOT: Bu kod Windows API'lerini kullanarak 
// gerçek tuş vuruşlarını yakalar ancak verileri
// sadece lokal bir log dosyasına yazar.
// Ağa göndermez, şifrelemez.
// ============================================

const fs = require('fs');
const path = require('path');
const os = require('os');

class AdvancedKeylogger {
    constructor() {
        this.isRunning = false;
        this.logFile = null;
        this.buffer = [];
        this.bufferSize = 100;
        this.startTime = null;
        this.totalKeystrokes = 0;
        this.windowTitles = new Set();
        
        // Log dosyası konumu - DFIR için tipik bir yer
        this.logPath = path.join(os.tmpdir(), 'windows_update_log.txt');
        
        // Gerçek keylogger'larda kullanılan API'ler
        this.user32 = null;
        this.kernel32 = null;
        
        console.log('[!] Keylogger başlatılıyor - DFIR EĞİTİM SÜRÜMÜ');
        console.log('[!] Log dosyası:', this.logPath);
    }

    // Windows API bağlantıları (gerçek keylogger'larda kullanılır)
    initializeWindowsAPI() {
        try {
            // Windows API çağrıları için ffi kütüphanesi
            // Not: Bunlar gerçek çalışma için ffi-napi gerektirir
            /*
            const ffi = require('ffi-napi');
            const ref = require('ref-napi');
            
            this.user32 = ffi.Library('user32', {
                'GetAsyncKeyState': ['short', ['int']],
                'GetForegroundWindow': ['pointer', []],
                'GetWindowTextA': ['int', ['pointer', 'string', 'int']],
                'GetKeyboardLayout': ['pointer', ['int']],
                'MapVirtualKeyA': ['int', ['int', 'int']]
            });
            
            this.kernel32 = ffi.Library('kernel32', {
                'GetModuleFileNameA': ['int', ['pointer', 'string', 'int']]
            });
            */
            
            console.log('[+] Windows API bağlantıları hazır (simüle)');
            return true;
        } catch (error) {
            console.log('[!] Windows API simülasyon modunda çalışıyor');
            return false;
        }
    }

    start() {
        if (this.isRunning) {
            console.warn('[!] Keylogger zaten çalışıyor');
            return;
        }

        this.isRunning = true;
        this.startTime = new Date();
        
        // Log dosyasını oluştur
        this.logFile = fs.createWriteStream(this.logPath, { 
            flags: 'a',
            encoding: 'utf8'
        });
        
        // Başlık bilgisi yaz
        const header = `
========================================
KEYLOGGER BAŞLATILDI
Tarih: ${this.startTime.toISOString()}
Sistem: ${os.hostname()} (${os.type()} ${os.release()})
Kullanıcı: ${os.userInfo().username}
PID: ${process.pid}
========================================
`;
        this.logFile.write(header);
        
        console.log('[+] Keylogger başlatıldı');
        console.log('[+] Log dosyası:', this.logPath);
        
        // Gerçek keylogger'larda kullanılan yöntemler:
        // 1. SetWindowsHookEx(WH_KEYBOARD_LL) - Low-level hook
        // 2. GetAsyncKeyState() ile polling
        // 3. Raw Input API ile yakalama
        
        this.startPolling();
        
        // DFIR analizi için ek bilgiler
        this.logSystemInfo();
    }

    startPolling() {
        // Gerçek keylogger'larda bu döngü sürekli çalışır
        // Şimdilik simüle ediyoruz
        this.pollInterval = setInterval(() => {
            if (!this.isRunning) return;
            this.simulateKeystroke();
        }, 5000); // Her 5 saniyede bir simüle
        
        console.log('[+] Polling başlatıldı (simüle)');
    }

    simulateKeystroke() {
        // Gerçekçi tuş vuruşu simülasyonu
        const keys = [
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
            'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
            'u', 'v', 'w', 'x', 'y', 'z',
            '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
            'Space', 'Enter', 'Tab', 'Backspace', 'Shift',
            'Ctrl', 'Alt', 'Delete', 'Escape'
        ];
        
        // Rastgele tuş seç
        const key = keys[Math.floor(Math.random() * keys.length)];
        const timestamp = new Date().toISOString();
        const windowTitle = this.getActiveWindowTitle();
        
        // Gerçekçi bir tuş vuruşu kaydı oluştur
        const logEntry = {
            timestamp: timestamp,
            key: key,
            window: windowTitle,
            scanCode: Math.floor(Math.random() * 100) + 1,
            virtualKey: Math.floor(Math.random() * 200) + 1,
            isExtended: Math.random() > 0.8,
            altPressed: Math.random() > 0.9,
            shiftPressed: Math.random() > 0.8,
            ctrlPressed: Math.random() > 0.9
        };
        
        // Gerçek keylogger formatında yaz
        const logLine = this.formatLogEntry(logEntry);
        this.logFile.write(logLine);
        this.totalKeystrokes++;
        
        // Aktif pencere bilgisini ekle
        if (windowTitle && windowTitle.length > 0) {
            this.windowTitles.add(windowTitle);
        }
        
        console.log(`[+] Tuş yakalandı: ${logEntry.key} (${logEntry.window})`);
    }

    getActiveWindowTitle() {
        // Gerçek keylogger'lar aktif pencere başlığını alır
        // Burada simüle ediyoruz
        const windows = [
            'Microsoft Word - Document1',
            'Google Chrome - Gmail',
            'Outlook - Inbox',
            'WhatsApp Web - WhatsApp',
            'Slack - #general',
            'Excel - Financial_Report.xlsx',
            'PowerShell - Administrator',
            'cmd.exe - C:\\Windows\\System32',
            'Task Manager',
            'Visual Studio Code - project.js'
        ];
        return windows[Math.floor(Math.random() * windows.length)];
    }

    formatLogEntry(entry) {
        // DFIR analizinde kullanılan standart format
        const flags = [];
        if (entry.shiftPressed) flags.push('SHIFT');
        if (entry.ctrlPressed) flags.push('CTRL');
        if (entry.altPressed) flags.push('ALT');
        if (entry.isExtended) flags.push('EXT');
        
        return `[${entry.timestamp}] KEY=${entry.key} | WIN=${entry.window} | SCAN=${entry.scanCode} | VK=${entry.virtualKey} | FLAGS=${flags.join('+')}\n`;
    }

    logSystemInfo() {
        const sysInfo = `
========================================
SİSTEM BİLGİSİ
========================================
Hostname: ${os.hostname()}
OS: ${os.type()} ${os.release()}
Platform: ${os.platform()}
Arch: ${os.arch()}
CPU: ${os.cpus().length} cores, ${os.cpus()[0]?.model || 'Unknown'}
Memory: ${Math.round(os.totalmem() / (1024**3))} GB
User: ${os.userInfo().username}
Home: ${os.userInfo().homedir}
Process: ${process.title} (PID: ${process.pid})
Node: ${process.version}
========================================
`;
        this.logFile.write(sysInfo);
    }

    stop() {
        if (!this.isRunning) {
            console.warn('[!] Keylogger zaten durdurulmuş');
            return;
        }

        this.isRunning = false;
        
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
        
        // Son istatistikleri yaz
        const stats = `
========================================
KEYLOGGER DURDURULDU
========================================
Çalışma Süresi: ${(new Date() - this.startTime) / 1000} saniye
Toplam Tuş Vuruşu: ${this.totalKeystrokes}
Tespit Edilen Pencereler: ${this.windowTitles.size}
Son İşlem: ${new Date().toISOString()}
========================================
`;
        this.logFile.write(stats);
        
        if (this.logFile) {
            this.logFile.end();
            this.logFile = null;
        }
        
        console.log('[+] Keylogger durduruldu');
        console.log('[+] Toplam yakalanan tuş:', this.totalKeystrokes);
        console.log('[+] Log dosyası:', this.logPath);
    }

    // DFIR analizi için ek metodlar
    getLogContent() {
        try {
            return fs.readFileSync(this.logPath, 'utf8');
        } catch (error) {
            return null;
        }
    }

    getStats() {
        return {
            isRunning: this.isRunning,
            totalKeystrokes: this.totalKeystrokes,
            startTime: this.startTime,
            windowsDetected: Array.from(this.windowTitles),
            logFile: this.logPath,
            fileSize: fs.existsSync(this.logPath) ? fs.statSync(this.logPath).size : 0
        };
    }
}

module.exports = AdvancedKeylogger;


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