# İzolasyon Kontrol Listesi

Bu depodaki kod, gerçek internete çıkmayacak şekilde tasarlandı (tüm C2
trafiği `127.0.0.1`'e sabit). Yine de demoyu çalıştırmadan önce aşağıdakileri
uygulayın -- savunma katmanlarının hiçbiri koddan gelmiyor, tamamen sizin VM
kurulumunuza bağlı.

## Demodan önce

- [ ] Demoyu **ayrı, izole bir sanal makinede** çalıştırın (ana makinenizde değil).
- [ ] VM ağ adaptörünü **Host-only** veya **Internal Network** yapın -- gerçek
      internete çıkışı olmasın.
- [ ] Windows Defender'ı (veya kullandığınız AV/EDR'yi) bu VM'de kendi
      takdirinizle devre dışı bırakın / VM'i dışlayın. **Bu depo bunu otomatik
      yapmaz** -- bilinçli bir tasarım tercihi.
- [ ] Temiz bir **snapshot** alın.

## Demo sırasında

- [ ] `attacker-c2` ve `victim-repo`'yu aynı VM içinde, iki ayrı terminalde çalıştırın.
- [ ] `DEMO_ACTIVE=1` bayrağı olmadan hiçbir demo betiğinin tetiklenmediğini unutmayın.
- [ ] `victim-repo/scripts/filescanner.js`'in yalnızca `demo-victim-data/`
      klasörünü taradığını (gerçek kişisel dosyalara dokunmadığını) `config.js`
      üzerinden teyit edin.

## Demodan sonra

- [ ] `taskkill /F /IM node.exe` ile açık kalan demo süreçlerini kapatın.
- [ ] VM'i **snapshot'a geri döndürün** -- Startup klasörüne ve zamanlanmış
      görevlere bırakılan demo kalıcılık dosyalarını temizlemenin en güvenli yolu budur.
- [ ] `attacker-c2/loot/` klasöründeki (tamamen sahte) demo verilerini isterseniz silin.

## Neden bu kadar katı?

Kod zararsız olsa da, "izole ortamda çalıştırma" alışkanlığının kendisi --
her ciddi malware analiz laboratuvarında olduğu gibi -- öğretilmeye değer bir
disiplin. Sunumda bunu izleyicilere de bir cümleyle aktarmanızı öneririz.
