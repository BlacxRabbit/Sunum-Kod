# Contagious Interview — Zararsız Vaka Simülasyonu

Bu depo, "**Job Interview or North Koreans? A Contagious Interview Intrusion**" adlı DFIR vaka
raporunda anlatılan saldırı zincirinin **eğitim amaçlı, zararsız bir yeniden canlandırmasıdır**.
Senior güvenlik ekibine yönelik bir webinar sunumunda "kurban" ve "saldırgan" tarafını canlı
olarak göstermek için hazırlanmıştır.

> ⚠️ **Bu kod gerçek bir zararlı yazılım DEĞİLDİR.** Gerçek internete çıkmaz, gerçek kimlik
> bilgisi çalmaz, gerçek tuş vuruşu/ekran görüntüsü yakalamaz, hiçbir tespit mekanizmasını
> atlatmaya çalışmaz. Sadece raporda anlatılan **akışın mantığını** (dosya adı maskeleme, aşamalı
> yükleme, C2 kaydı, kalıcılık, dosya tarama gibi) izole bir ortamda göstermek için yazılmıştır.

## Neden bu depo var

Rapordaki teknikleri "anlatmak" yerine **göstermek**, senior bir dinleyici kitlesi için çok daha
güçlü bir öğrenme aracı. Ama gerçek saldırı kodunu (özellikle AV atlatma, gerçek keylogging,
gerçek tarayıcı şifre çözme) yeniden üretmek hem gereksiz hem riskli — çünkü zararsız bir demo
payload'ı olsa bile, üretilen *teknik* (ör. bir tespit atlatma yöntemi) demodan bağımsız olarak
tekrar kullanılabilir hale gelir. Bu yüzden bu depo bilinçli olarak ikiye ayrılmıştır:

- **Gerçekten çalışan kod**: dosya adı maskeleme, aşamalı yükleme zinciri, sistem/VM parmak izi
  çıkarma, kendi kontrolündeki bir mock C2 sunucusuna kayıt olma, sabit ve zararsız bir komut
  listesiyle sınırlı uzaktan kontrol, dosya tarama + eşleşen (tamamen sahte) dosyaları yükleme,
  Startup klasörü / zamanlanmış görev ile kalıcılık, sahte web uygulamasının açılması.
- **Bilinçli olarak yazılmamış kod**: gerçek klavye/pano/ekran yakalama, gerçek tarayıcı şifre
  çözme, gerçek uzak erişim aracı (AnyDesk vb.) indirme, Defender exclusion ekleme, keyfi uzak
  komut çalıştırma (arbitrary remote code execution). Bu kısımlar ilgili dosyalarda **sadece
  açıklayıcı yorum satırı / boş fonksiyon iskeleti** olarak bırakılmıştır — rapordaki karşılığına
  referans verir, ama çalışmaz.

## Dizin yapısı

| Yol | Rapordaki karşılığı | Durum |
|---|---|---|
| `victim-repo/` | `InfiniGodsOrg/RealEstate_Marketplace` (sahte iş görüşmesi reposu) | Çalışır (kısmen) |
| `victim-repo/public/fontawesome/fa-solid-400.woff2` | Font kılığındaki Stage-1 backdoor dosyası | Çalışır |
| `victim-repo/scripts/stage2-loader.js` | `%TEMP%\programx64\main.js` | Çalışır |
| `victim-repo/scripts/backdoor.js` | OtterCookie (sysinfo + VM tespiti + C2 kanalı) | Çalışır (whitelist'li) |
| `victim-repo/scripts/filescanner.js` | InvisibleFerret JS dosya tarayıcı | Çalışır (demo klasörüyle sınırlı) |
| `victim-repo/scripts/persistence.js` | Startup klasörü + "Runtime Broker" scheduled task | Çalışır |
| `victim-repo/scripts/open-decoy.ps1` | `-EncodedCommand` ile sahte web app açma | Çalışır |
| `victim-repo/surveillance/*.stub.js` | Keylogger, ekran görüntüsü, tarayıcı kimlik bilgisi hırsızlığı | **Yalnızca yorum / iskelet** |
| `attacker-c2/` | Saldırgan C2 altyapısı + operatör paneli | Çalışır (yalnızca localhost) |
| `docs/mitre-mapping.md` | Saldırı zincirinin ATT&CK haritası | Referans doküman |
| `setup/ISOLATION-CHECKLIST.md` | VM izolasyon kontrol listesi | Referans doküman |

## Demoyu çalıştırmadan önce (zorunlu)

1. **İzole bir sanal makinede çalıştır.** Ağ adaptörünü "Host-only" / "Internal Network" yap,
   gerçek internete çıkışı olmasın. Bkz. [`setup/ISOLATION-CHECKLIST.md`](setup/ISOLATION-CHECKLIST.md).
2. VM'de Windows Defender'ı (veya kullandığın AV'yi) kendi takdirinle devre dışı bırak / bu makineyi
   dışla — bu depo bunu **otomatik yapmaz**, bilinçli olarak senin manuel kontrolünde bırakıldı.
3. Demodan önce bir **snapshot** al, demo bitince snapshot'a geri dön.
4. `attacker-c2` ve `victim-repo`'yu **aynı izole VM içinde**, iki ayrı terminalde çalıştır —
   ikisi de sadece `127.0.0.1` üzerinden konuşur, dışarı çıkmaz.

## Çalıştırma sırası

```bash
# 1) Saldırgan tarafı (mock C2 + operatör konsolu)
cd attacker-c2
npm install
npm start          # C2 sunucusunu 127.0.0.1:4000'de ayağa kaldırır

# 2) Ayrı bir terminalde operatör konsolunu aç
npm run operator   # bağlanan "kurbanları" listele, whitelist komut gönder

# 3) Kurban tarafı — demo bilinçli tetiklenmeden çalışmaz (bkz. package.json)
cd ../victim-repo
DEMO_ACTIVE=1 npm install    # postinstall hook zinciri burada tetiklenir
```

`DEMO_ACTIVE=1` olmadan `npm install` sadece bağımlılıkları kurar, hiçbir demo betiği çalışmaz —
bu, deponun birisi tarafından incelenirken/klonlanırken yanlışlıkla tetiklenmesini önlemek için
bilinçli bir güvenlik tercihidir.

## Sunumda kullanılabilecek akış

1. `victim-repo`'da `DEMO_ACTIVE=1 npm install` çalıştır → izleyiciye `fa-solid-400.woff2`'nin
   aslında JS olduğunu, çalışırken ne yaptığını göster.
2. `attacker-c2` operatör konsolunda yeni "kurbanın" bağlandığını, VM/Local etiketini, sistem
   bilgisini canlı göster.
3. Operatör konsolundan whitelist'teki komutlardan birini gönder (ör. `listDemoFiles`) →
   `filescanner.js`'in bulduğu sahte dosyaların `attacker-c2/loot/` klasörüne düştüğünü göster.
4. `open-decoy.ps1`'in sahte gayrimenkul sitesini açtığını göster — "kurban hiçbir şey fark
   etmiyor" anını canlandır.
5. `victim-repo/surveillance/*.stub.js` dosyalarını açıp, gerçek vakada burada neyin çalıştığını
   (yorum satırlarından) anlat — kod çalıştırma, sadece göster.
6. `persistence.js`'in Startup klasörüne bıraktığı dosyayı Gezgin'de göster.
7. Kapanışta `taskkill /F /IM node.exe` ile kendi "backdoor"unu manuel kapat — rapordaki
   operatörün oturumu sonlandırmasıyla birebir aynı sahne.

## Kaynak

Teknik detayların tamamı şu rapora dayanır: *"Job Interview or North Koreans? A Contagious
Interview Intrusion"* (MISP olay raporu, 2025-11-20 vakası). Bkz. [`docs/mitre-mapping.md`](docs/mitre-mapping.md).
