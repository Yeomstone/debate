# DebateAdminFrontEnd Deployment Script (PowerShell)
# Usage: .\deploy-frontend-admin.ps1

$SSH_KEY = Join-Path $PSScriptRoot "private_info\AWS\debate2025.pem"
$SERVER = "ubuntu@13.209.254.24"
$LOCAL_PROJECT = Join-Path $PSScriptRoot "DebateAdmin\DebateAdminFrontEnd"
$REMOTE_PATH = "opt/debate/frontendAdmin"

Write-Host "=== DebateAdminFrontEnd Deployment Start ===" -ForegroundColor Green

# 1. Check dependencies
Write-Host "`n[1/4] Checking dependencies..." -ForegroundColor Yellow
Push-Location $LOCAL_PROJECT
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing node_modules..."
    npm install
}

# 2. Build
Write-Host "`n[2/4] Building for production..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

$DIST_PATH = Join-Path $LOCAL_PROJECT "dist"
Write-Host "Build complete: $DIST_PATH" -ForegroundColor Cyan

# 3. Upload
Write-Host "`n[3/4] Uploading files to server..." -ForegroundColor Yellow
Write-Host "Checking/Creating remote directory: $REMOTE_PATH"
ssh -i $SSH_KEY $SERVER "mkdir -p $REMOTE_PATH"
scp -r -i $SSH_KEY "${DIST_PATH}/*" "${SERVER}:${REMOTE_PATH}/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Upload failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Upload complete" -ForegroundColor Cyan

# 4. Reload Nginx
Write-Host "`n[4/4] Restarting Nginx..." -ForegroundColor Yellow
ssh -i $SSH_KEY $SERVER "sudo nginx -t && sudo systemctl reload nginx"
Write-Host "Nginx reload complete" -ForegroundColor Cyan

Write-Host "`n=== Deployment Complete ===" -ForegroundColor Green
