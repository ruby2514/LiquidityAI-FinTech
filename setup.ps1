<#
.SYNOPSIS
  DonnaAI FinTech - Automated Setup Script (Windows)
.DESCRIPTION
  Checks prerequisites, installs dependencies, configures environment,
  builds the production frontend, and prints getting-started instructions.
#>

$ErrorActionPreference = "Stop"
$script:DockerAvailable = $false

function Write-Banner {
  Write-Host ""
  Write-Host "  ====================================================" -ForegroundColor Cyan
  Write-Host "   DonnaAI FinTech - Financial Intelligence Graph"       -ForegroundColor Cyan
  Write-Host "         Automated Setup for Windows"                    -ForegroundColor Cyan
  Write-Host "  ====================================================" -ForegroundColor Cyan
  Write-Host ""
}

function Write-Step { param([string]$msg) Write-Host "`n> $msg" -ForegroundColor Green }
function Write-Ok { param([string]$msg) Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Warn { param([string]$msg) Write-Host "  [WARN] $msg" -ForegroundColor Yellow }
function Write-Fail { param([string]$msg) Write-Host "  [FAIL] $msg" -ForegroundColor Red; exit 1 }

function Test-Prerequisites {
  Write-Step "Checking prerequisites..."

  try {
    $nodeVer = (node -v) -replace 'v', ''
    $nodeMajor = [int]($nodeVer.Split('.')[0])
    if ($nodeMajor -ge 18) {
      Write-Ok "Node.js $nodeVer"
    }
    else {
      Write-Fail "Node.js 18+ required (found $nodeVer). Download from https://nodejs.org"
    }
  }
  catch {
    Write-Fail "Node.js not found. Download from https://nodejs.org (v18 or later)"
  }

  try {
    $npmVer = npm -v 2>$null
    Write-Ok "npm $npmVer"
  }
  catch {
    Write-Fail "npm not found. It should come with Node.js."
  }

  try {
    $gitVer = (git --version) -replace 'git version ', ''
    Write-Ok "Git $gitVer"
  }
  catch {
    Write-Warn "Git not found - not required but recommended."
  }

  try {
    $dockerVer = (docker --version) -replace 'Docker version ', '' -replace ',.*', ''
    Write-Ok "Docker $dockerVer"
    $script:DockerAvailable = $true
  }
  catch {
    Write-Warn "Docker not found - Docker deployment will be unavailable."
  }
}

function Install-Dependencies {
  Write-Step "Installing Node.js dependencies..."
  npm install --no-audit --no-fund 2>&1 | Select-Object -Last 1
  Write-Ok "Dependencies installed"
}

function Initialize-Environment {
  Write-Step "Setting up environment..."
  if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    $jwt = node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
    $content = Get-Content ".env" -Raw
    $content = $content -replace 'CHANGE_ME_TO_A_RANDOM_64_CHAR_HEX_STRING', $jwt
    Set-Content ".env" -Value $content
    Write-Ok "Created .env with generated JWT secret"
  }
  else {
    Write-Ok ".env already exists - skipping"
  }
}

function Initialize-DataDir {
  Write-Step "Creating data directory..."
  if (-not (Test-Path "data")) {
    New-Item -ItemType Directory -Path "data" | Out-Null
  }
  Write-Ok "data/ directory ready"
}

function Build-Frontend {
  Write-Step "Building frontend for production..."
  npm run build 2>&1 | Select-Object -Last 3
  Write-Ok "Frontend built to dist/"
}

function Write-Summary {
  Write-Host ""
  Write-Host "  ====================================================" -ForegroundColor Cyan
  Write-Host "              Setup Complete!                          " -ForegroundColor Cyan
  Write-Host "  ====================================================" -ForegroundColor Cyan
  Write-Host ""
  Write-Host "  Start development server:" -ForegroundColor White
  Write-Host "    npm run dev" -ForegroundColor Cyan
  Write-Host "    Frontend: http://localhost:5173" -ForegroundColor Green
  Write-Host "    API:      http://localhost:3001" -ForegroundColor Green
  Write-Host ""
  Write-Host "  Start production server:" -ForegroundColor White
  Write-Host "    npm start" -ForegroundColor Cyan
  Write-Host "    App: http://localhost:3001" -ForegroundColor Green
  Write-Host ""

  if ($script:DockerAvailable) {
    Write-Host "  Docker deployment (for sharing on LAN):" -ForegroundColor White
    Write-Host "    docker compose up --build -d" -ForegroundColor Cyan
    Write-Host "    App: http://YOUR_IP:4001" -ForegroundColor Green
    Write-Host ""
  }

  Write-Host "  Default admin account:" -ForegroundColor White
  Write-Host ""
  Write-Host "    DonnaAI (Super Admin)" -ForegroundColor Yellow
  Write-Host "    Email:    donna@donnaai.com"
  Write-Host "    Password: DonnAI2026!"
  Write-Host ""
  Write-Host "  WARNING: Change this password after first login!" -ForegroundColor Red
  Write-Host ""
}

# ---- Main ----
Write-Banner
Test-Prerequisites
Install-Dependencies
Initialize-Environment
Initialize-DataDir
Build-Frontend
Write-Summary
