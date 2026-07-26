# open-decoy.ps1
# ---------------
# RAPORDAKI KARSILIGI:
#   %WINDIR%\System32\WindowsPowerShell\v1.0\powershell -NoProfile -NonInteractive
#     -ExecutionPolicy Bypass -EncodedCommand UwB0AGEAcgB0ACAAIgBoAHQAdABwADoALwAvAGwAbwBjAGEA...
#
# Decode edilince ortaya cikan komut: Start "http://localhost:5173/"
#
# Bayrak aciklamalari:
#   -NoProfile          : kullanicinin PowerShell profil betigini yuklemez (hiz + iz azaltma)
#   -NonInteractive      : etkilesimli prompt gostermez
#   -ExecutionPolicy Bypass : betik calistirma politikasini SADECE bu oturum icin devre disi birakir
#   -EncodedCommand      : komutu Base64 (UTF-16LE) olarak alir; komut satiri loglarinda
#                          duz metin olarak gorunmez, bir cozme adimi gerektirir
#
# Bu demo dosyasi ayni teknigi (Base64 kodlu -EncodedCommand ile bir URL acma)
# birebir uyguluyor -- cunku bu adimda gercekten zararli hicbir sey yok,
# sadece yerel demo web uygulamasini tarayicida aciyor. Rapordaki "kurban hicbir
# sey fark etmiyor" anini canlandirmak icin.

$decoyUrl = "http://localhost:5173/"

# Rapordaki EncodedCommand uretim mantiginin ayni sekilde gosterimi:
$rawCommand = "Start `"$decoyUrl`""
$bytes = [System.Text.Encoding]::Unicode.GetBytes($rawCommand)
$encodedCommand = [Convert]::ToBase64String($bytes)

Write-Host "[demo] Decoy web app aciliyor (rapordaki -EncodedCommand teknigiyle): $decoyUrl"

powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -EncodedCommand $encodedCommand
