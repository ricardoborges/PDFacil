# Build script para PDFacil Desktop (Tauri)
# Uso: .\build-tauri.ps1 [-Debug] [-SkipDeps]

param(
    [switch]$Debug,
    [switch]$SkipDeps
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PDFacil - Tauri Desktop Build" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Rust
Write-Host "[1/5] Verificando Rust..." -ForegroundColor Yellow
if (!(Get-Command rustc -ErrorAction SilentlyContinue)) {
    Write-Host "ERRO: Rust nao encontrado. Instale em: https://rustup.rs/" -ForegroundColor Red
    exit 1
}
$rustVersion = rustc --version
Write-Host "  Rust: $rustVersion" -ForegroundColor Green

# Verificar Node.js
Write-Host "[2/5] Verificando Node.js..." -ForegroundColor Yellow
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "ERRO: Node.js nao encontrado. Instale em: https://nodejs.org/" -ForegroundColor Red
    exit 1
}
$nodeVersion = node --version
Write-Host "  Node.js: $nodeVersion" -ForegroundColor Green

# Verificar npm
if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "ERRO: npm nao encontrado." -ForegroundColor Red
    exit 1
}
$npmVersion = npm --version
Write-Host "  npm: $npmVersion" -ForegroundColor Green

# Instalar dependencias
if (!$SkipDeps) {
    Write-Host "[3/5] Instalando dependencias npm..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERRO: Falha ao instalar dependencias npm" -ForegroundColor Red
        exit 1
    }
    Write-Host "  Dependencias instaladas com sucesso" -ForegroundColor Green
} else {
    Write-Host "[3/5] Pulando instalacao de dependencias (--SkipDeps)" -ForegroundColor Yellow
}

# Build do frontend
Write-Host "[4/5] Compilando frontend (Vite)..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Falha ao compilar frontend" -ForegroundColor Red
    exit 1
}
Write-Host "  Frontend compilado com sucesso" -ForegroundColor Green

# Build Tauri
Write-Host "[5/5] Compilando aplicacao Tauri..." -ForegroundColor Yellow
if ($Debug) {
    Write-Host "  Modo: Debug" -ForegroundColor Magenta
    npm run tauri build -- --debug
} else {
    Write-Host "  Modo: Release" -ForegroundColor Magenta
    npm run tauri build
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Falha ao compilar Tauri" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Build concluido com sucesso!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Arquivos gerados em:" -ForegroundColor Cyan
Write-Host "  src-tauri\target\release\bundle\" -ForegroundColor White
Write-Host ""
Write-Host "Instaladores disponiveis:" -ForegroundColor Cyan
Write-Host "  - MSI: src-tauri\target\release\bundle\msi\" -ForegroundColor White
Write-Host "  - NSIS: src-tauri\target\release\bundle\nsis\" -ForegroundColor White
