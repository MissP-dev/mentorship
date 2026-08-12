# ============================================================
#  Mentor Connect — Windows setup script (PowerShell)
#  Run from the project root:  .\setup.ps1
# ============================================================
$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Mentor Connect Setup (Windows)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1) Node.js check
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js is not installed or not in PATH." -ForegroundColor Red
    Write-Host "        Install it from https://nodejs.org (LTS) then reopen the terminal." -ForegroundColor Yellow
    exit 1
}
Write-Host "[OK] Node $(node --version) / npm $(npm --version)" -ForegroundColor Green

# 2) PostgreSQL check
$psqlCandidates = @(
    "C:\Program Files\PostgreSQL\18\bin\psql.exe",
    "C:\Program Files\PostgreSQL\17\bin\psql.exe",
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files\PostgreSQL\15\bin\psql.exe"
)
$psql = $psqlCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $psql) {
    $cmd = Get-Command psql -ErrorAction SilentlyContinue
    if ($cmd) { $psql = $cmd.Source }
}
if (-not $psql) {
    Write-Host "[WARN] psql was not found. Make sure PostgreSQL is installed and running." -ForegroundColor Yellow
    Write-Host "       You can still continue; the script will try to connect via Node later." -ForegroundColor Yellow
} else {
    Write-Host "[OK] Found PostgreSQL: $psql" -ForegroundColor Green
}

$svc = Get-Service | Where-Object { $_.Name -like "postgresql*" -and $_.Status -eq "Running" }
if ($svc) {
    Write-Host "[OK] PostgreSQL service is running ($($svc.Name))" -ForegroundColor Green
} elseif (Get-Service | Where-Object { $_.Name -like "postgresql*" }) {
    Write-Host "[WARN] PostgreSQL service exists but is NOT running. Start it from Services or pgAdmin." -ForegroundColor Yellow
} else {
    Write-Host "[WARN] No PostgreSQL service found. Install PostgreSQL from https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
}

# 3) Backend .env
$backendDir = Join-Path $PSScriptRoot "mconnect\backend"
$envFile = Join-Path $backendDir ".env"
if (-not (Test-Path -LiteralPath $envFile)) {
    if (Test-Path -LiteralPath (Join-Path $backendDir ".env.example")) {
        Copy-Item -LiteralPath (Join-Path $backendDir ".env.example") -Destination $envFile
        Write-Host "[OK] Created $envFile from .env.example" -ForegroundColor Green
        Write-Host "     IMPORTANT: Edit it and set the correct DATABASE_URL password!" -ForegroundColor Yellow
    } else {
        Write-Host "[WARN] No .env file found and no .env.example to copy." -ForegroundColor Yellow
    }
} else {
    Write-Host "[OK] .env already exists (using it as-is)" -ForegroundColor Green
}

# 4) Install dependencies
Write-Host "`nInstalling backend dependencies..." -ForegroundColor Cyan
Push-Location (Join-Path $PSScriptRoot "mconnect\backend")
npm install
if ($LASTEXITCODE -ne 0) { Pop-Location; exit 1 }
Pop-Location

Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
Push-Location (Join-Path $PSScriptRoot "mconnect\frontend")
npm install
if ($LASTEXITCODE -ne 0) { Pop-Location; exit 1 }
Pop-Location

# 5) Try to create the database + sync the schema
Write-Host "`nSyncing the database schema (Prisma)..." -ForegroundColor Cyan
Push-Location (Join-Path $PSScriptRoot "mconnect\backend")
$dbUrl = $null
if (Test-Path -LiteralPath $envFile) {
    $line = (Get-Content -LiteralPath $envFile | Where-Object { $_ -match "^DATABASE_URL=" } | Select-Object -First 1)
    if ($line) { $dbUrl = $line.Substring($line.IndexOf("=") + 1).Trim('"') }
}
if ($dbUrl) {
    if ($dbUrl -match "postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(\w+)") {
        $dbUser = $Matches[1]; $dbPass = $Matches[2]; $dbHost = $Matches[3]; $dbPort = $Matches[4]; $dbName = $Matches[5]
        if ($psql) {
            $env:PGPASSWORD = $dbPass
            & $psql -U $dbUser -h $dbHost -p $dbPort -t -c "SELECT 1 FROM pg_database WHERE datname='$dbName'" | Out-Null
            if ($LASTEXITCODE -ne 0) {
                Write-Host "[WARN] Could not reach the database. Start PostgreSQL, then re-run this script." -ForegroundColor Yellow
            } else {
                Write-Host "[OK] Connected to PostgreSQL. Ensuring database '$dbName' exists..." -ForegroundColor Green
                & $psql -U $dbUser -h $dbHost -p $dbPort -t -c "CREATE DATABASE `"$dbName`"" 2>$null | Out-Null
                if ($LASTEXITCODE -eq 0) { Write-Host "[OK] Created database '$dbName'" -ForegroundColor Green }
            }
        }
    }
}
npx prisma generate
npx prisma db push
Pop-Location

# 6) Done
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To run the app, open TWO terminals:" -ForegroundColor White
Write-Host "  1) Backend :  cd mconnect\backend ; npm run dev" -ForegroundColor Yellow
Write-Host "  2) Frontend:  cd mconnect\frontend; npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "Then open  http://localhost:5173  in your browser." -ForegroundColor Green
Write-Host "To test on your PHONE, open  http://<this PC's IP>:5173  (same Wi-Fi)." -ForegroundColor Green
Write-Host ""
Write-Host "Demo login:  admin@mconnect.com  /  password123   (run backend\seed.js to reset data)" -ForegroundColor Cyan
Write-Host ""
