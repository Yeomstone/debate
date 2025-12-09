# DebateUserFrontEnd Deployment Script (PowerShell)
# Usage: .\deploy-frontend.ps1

$SSH_KEY = Join-Path $PSScriptRoot "private_info\AWS\debate2025.pem"
$SERVER = "ubuntu@13.209.254.24"
$FRONTEND_DIR = Join-Path $PSScriptRoot "DebateUser\DebateUserFrontEnd"
$DIST_DIR = "dist"
$REMOTE_PATH = "opt/debate/frontend" # Relative path from home

Write-Host "=== DebateUserFrontEnd Deployment Start ===" -ForegroundColor Green

# Check .env.production
$envFile = Join-Path $FRONTEND_DIR ".env.production"
if (-not (Test-Path $envFile)) {
    Write-Host "WARNING: .env.production file not found." -ForegroundColor Yellow
    Write-Host "Using default (/api). Recommended to create .env.production for production." -ForegroundColor Yellow
}

# 1. Install Dependencies
Write-Host "`n[1/4] Checking dependencies..." -ForegroundColor Yellow
Set-Location $FRONTEND_DIR
if (-not (Test-Path "node_modules")) {
    Write-Host "node_modules not found. Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Dependency installation failed!" -ForegroundColor Red
        exit 1
    }
}

# 2. Production Build
Write-Host "`n[2/4] Building for production..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

# Check dist
$distPath = Join-Path (Get-Location) $DIST_DIR
if (-not (Test-Path $distPath)) {
    Write-Host "dist directory not found: $distPath" -ForegroundColor Red
    exit 1
}

Write-Host "Build complete: $distPath" -ForegroundColor Green

# 3. Upload to Server
Write-Host "`n[3/4] Uploading files to server..." -ForegroundColor Yellow

# Create remote directory if not exists and set permissions
Write-Host "Checking/Creating remote directory: $REMOTE_PATH"
ssh -i $SSH_KEY $SERVER "mkdir -p $REMOTE_PATH && sudo chown -R ubuntu:ubuntu $REMOTE_PATH && chmod -R 755 $REMOTE_PATH"

# Clear existing files and upload new ones
Write-Host "Clearing existing files..."
ssh -i $SSH_KEY $SERVER "rm -rf ${REMOTE_PATH}/* 2>/dev/null || true"
Write-Host "Uploading new files..."
scp -i $SSH_KEY -r "${distPath}\*" "${SERVER}:${REMOTE_PATH}/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Upload failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Upload complete" -ForegroundColor Green

# 4. Restart Nginx
Write-Host "`n[4/4] Restarting Nginx..." -ForegroundColor Yellow
ssh -i $SSH_KEY $SERVER "sudo systemctl reload nginx"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Nginx reload failed! (Nginx might not be installed or running)" -ForegroundColor Red
    Write-Host "Please check Nginx status on server." -ForegroundColor Yellow
} else {
    Write-Host "Nginx reload complete" -ForegroundColor Green
}

Write-Host "`n=== Deployment Complete ===" -ForegroundColor Green
Set-Location $PSScriptRoot
