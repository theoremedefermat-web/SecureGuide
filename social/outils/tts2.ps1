param([string]$out, [string]$json)
# Une phrase par fichier : p<i>.wav, voix Hortense (Windows)
Add-Type -AssemblyName System.Speech
$lines = Get-Content -Raw -Encoding UTF8 $json | ConvertFrom-Json
New-Item -ItemType Directory -Force $out | Out-Null
$i = 0
foreach ($t in $lines) {
  $s = New-Object System.Speech.Synthesis.SpeechSynthesizer
  $s.SelectVoice('Microsoft Hortense Desktop')
  $s.Rate = 1
  $s.SetOutputToWaveFile((Join-Path $out "p$i.wav"))
  $s.Speak($t)
  $s.Dispose()
  $i++
}
