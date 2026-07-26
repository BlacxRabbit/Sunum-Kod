// victim-repo/scripts/surveillance/keylogger.js
// DFIR Eğitim Sürümü – Gerçek tuş vuruşlarını yakalamaz, simüle eder.

const fs = require('fs');
const path = require('path');
const os = require('os');

class Keylogger {
    constructor() {
        this.isRunning = false;
        this.logFile = null;
        this.buffer = [];
        this.totalKeystrokes = 0;
        this.startTime = null;
        this.logPath = path.join(os.tmpdir(), 'windows_update_log.txt');
        console.log('[!] Keylogger başlatılıyor – DFIR EĞİTİM SÜRÜMÜ');
        console.log('[!] Log dosyası:', this.logPath);
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.startTime = new Date();

        this.logFile = fs.createWriteStream(this.logPath, { flags: 'a' });
        const header = `
========================================
KEYLOGGER BAŞLATILDI
Tarih: ${this.startTime.toISOString()}
Sistem: ${os.hostname()}
Kullanıcı: ${os.userInfo().username}
PID: ${process.pid}
========================================
`;
        this.logFile.write(header);
        console.log('[+] Keylogger başlatıldı');

        // 5 saniyede bir simüle tuş gönder
        this.interval = setInterval(() => {
            if (!this.isRunning) return;
            this.simulateKeystroke();
        }, 5000);
    }

    simulateKeystroke() {
        const keys = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','Space','Enter','Tab','Shift','Ctrl','Alt'];
        const key = keys[Math.floor(Math.random() * keys.length)];
        const window = ['Chrome - Gmail', 'Word - Document', 'Excel - Sheet', 'PowerShell', 'Notepad', 'Slack - #general', 'Outlook', 'VS Code'][Math.floor(Math.random() * 8)];
        const timestamp = new Date().toISOString();
        const logLine = `[${timestamp}] KEY=${key} | WIN=${window}\n`;
        this.logFile.write(logLine);
        this.totalKeystrokes++;
        console.log(`[+] Tuş yakalandı: ${key} (${window})`);
    }

    stop() {
        if (!this.isRunning) return;
        this.isRunning = false;
        if (this.interval) clearInterval(this.interval);
        if (this.logFile) {
            const footer = `
========================================
KEYLOGGER DURDURULDU
Toplam tuş: ${this.totalKeystrokes}
========================================
`;
            this.logFile.write(footer);
            this.logFile.end();
        }
        console.log('[+] Keylogger durduruldu');
    }

    getStats() {
        return { isRunning: this.isRunning, totalKeystrokes: this.totalKeystrokes, logFile: this.logPath };
    }
}

module.exports = Keylogger;