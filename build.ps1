# DeckMind AI — Chrome Web Store Packaging Script

Write-Host "[DeckMind AI] Building Chrome Web Store Package..." -ForegroundColor Cyan

$root = $PSScriptRoot
$nodeScript = Join-Path $root "package_cws.js"

if (Get-Command node -ErrorAction SilentlyContinue) {
    node $nodeScript
} else {
    Write-Host "[DeckMind AI] Node not found, falling back to PowerShell Compress-Archive..." -ForegroundColor Yellow
    $srcDir = Join-Path $root "src"
    $distDir = Join-Path $root "dist"
    $zipPath = Join-Path $distDir "deckmind-ai-chrome-store-upload.zip"

    if (-not (Test-Path $distDir)) {
        New-Item -ItemType Directory -Path $distDir -Force | Out-Null
    }
    if (Test-Path $zipPath) {
        Remove-Item $zipPath -Force
    }

    Compress-Archive -Path "$srcDir\*" -DestinationPath $zipPath -Force
    Write-Host "[DONE] Extension packaged at: $zipPath" -ForegroundColor Green
}
