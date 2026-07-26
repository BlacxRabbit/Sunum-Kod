# MITRE ATT&CK Haritalaması

Rapordaki saldırı zincirinin ATT&CK teknikleri ile eşlemesi, bu depodaki demo
dosyalarına referansla.

| Taktik | Teknik | Rapordaki karşılığı | Bu depodaki demo dosyası |
|---|---|---|---|
| Initial Access | Trusted Relationship / Sosyal Mühendislik | Sahte iş görüşmesi bahanesiyle repo klonlanması | `victim-repo/` (bütün olarak) |
| Defense Evasion | Masquerading (T1036) | `fa-solid-400.woff2` adıyla gizlenen JS | `victim-repo/public/fontawesome/fa-solid-400.woff2` |
| Defense Evasion | Obfuscated Files or Information (T1027) | obfuscator.io ile gizlenmiş JS; zlib+base64+ters çevirme ile Python | **Yazılmadı** — bkz. `README.md` "Neden bu depo var" |
| Defense Evasion | Impair Defenses (T1562.001) | Tsunami'nin Defender exclusion eklemesi | **Yazılmadı** — kullanıcı VM'i manuel olarak dışlıyor |
| Discovery | Virtualization/Sandbox Evasion (T1497) | `wmic` / `system_profiler` / `/proc/cpuinfo` ile VM tespiti | `victim-repo/scripts/backdoor.js` → `detectVirtualMachine()` |
| Discovery | System/File and Directory Discovery (T1082/T1083) | Sürücü/klasör taraması | `victim-repo/scripts/filescanner.js` |
| Command and Control | Application Layer Protocol – Web/WebSocket (T1071) | socket.io ile kalıcı komut kanalı | `victim-repo/scripts/backdoor.js`, `attacker-c2/server.js` |
| Command and Control | Ingress Tool Transfer (T1105) | p.zip, python payload'ları, AnyDesk indirme | Kısmen: `stage2-loader.js` (paket kurulumu); AnyDesk indirme **yazılmadı** |
| Execution | Command and Scripting Interpreter (arbitrary exec) | C2'den gelen komutun doğrudan `exec()` edilmesi | **Yazılmadı** — sabit whitelist ile sınırlandı, bkz. `backdoor.js` içindeki `WHITELISTED_ACTIONS` |
| Collection | Input Capture: Keylogging (T1056.001) | pyWinhook / node-global-key-listener | **Yazılmadı** — bkz. `victim-repo/surveillance/keylogger.stub.js` |
| Collection | Clipboard Data (T1115) | pyperclip ile pano izleme | **Yazılmadı** — bkz. `keylogger.stub.js` |
| Collection | Screen Capture (T1113) | screenshot-desktop + sharp | **Yazılmadı** — bkz. `victim-repo/surveillance/screenshot.stub.js` |
| Credential Access | Credentials from Password Stores (T1555.003) | Chromium os_crypt yeniden uygulaması | **Yazılmadı** — bkz. `victim-repo/surveillance/credential-theft.stub.js` |
| Persistence | Scheduled Task (T1053.005) | PowerShell ile "Runtime Broker" görevi | `victim-repo/scripts/persistence.js` → `installScheduledTaskPersistence()` |
| Persistence | Boot or Logon Autostart – Startup Folder (T1547.001) | Startup klasörüne kalıcılık dosyası | `victim-repo/scripts/persistence.js` → `installStartupPersistence()` |
| Command and Control | Remote Access Software (T1219) | AnyDesk indirip kurma | **Yazılmadı** |
| Exfiltration | Exfiltration Over C2 Channel (T1041) | Dosya/kimlik bilgisi/tuş kaydının C2'ye POST edilmesi | Kısmen: `filescanner.js` → `/upload` (yalnızca sahte demo dosyaları) |
| Defense Evasion | Deception (sahte decoy uygulama) | `-EncodedCommand` ile sahte web app'in açılması | `victim-repo/scripts/open-decoy.ps1`, `victim-repo/server.js` |

## Okuma rehberi

- **"Yazılmadı" olarak işaretlenen satırlar**: ilgili dosyada yalnızca açıklayıcı
  yorum satırları ve (varsa) hata fırlatan boş bir fonksiyon iskeleti bulunur.
  Kod çalıştırmadan, ekranda açıp anlatmak için tasarlandılar.
- **Whitelist notu**: rapordaki en kritik fark, C2'den gelen komutların bu
  demoda keyfi olarak çalıştırılamamasıdır. `backdoor.js` içindeki
  `WHITELISTED_ACTIONS` nesnesi, gerçek vakadaki `exec()` çağrısının yerini alır.
