# DebateAdminBackEnd Deployment Script (PowerShell)
# Usage: .\deploy-backend-admin.ps1

$SSH_KEY = Join-Path $PSScriptRoot "private_info\AWS\debate2025.pem"
$SERVER = "ubuntu@13.209.254.24"
$LOCAL_PROJECT = Join-Path $PSScriptRoot "DebateAdmin\DebateAdminBackEnd"
$REMOTE_PATH = "opt/debate/backendAdmin"
$JAR_NAME = "debate-admin-1.0.0.jar"
$SERVICE_NAME = "debate-admin-backend"
$GRADLE_EXEC = Join-Path $LOCAL_PROJECT "gradlew.bat"

Write-Host "=== DebateAdminBackEnd Deployment Start ===" -ForegroundColor Green

# 1. Build
Write-Host "`n[1/4] Building project..." -ForegroundColor Yellow
Push-Location $LOCAL_PROJECT
if (-not (Test-Path $GRADLE_EXEC)) {
    Write-Host "Gradle Wrapper not found at: $GRADLE_EXEC" -ForegroundColor Red
    Pop-Location
    exit 1
}
& $GRADLE_EXEC build -x test
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

$JAR_FILE = Join-Path $LOCAL_PROJECT "build\libs\$JAR_NAME"
if (-not (Test-Path $JAR_FILE)) {
    # Try without version
    $JAR_FILE = Get-ChildItem (Join-Path $LOCAL_PROJECT "build\libs\*.jar") | Where-Object { $_.Name -notmatch "plain" } | Select-Object -First 1 -ExpandProperty FullName
}
Write-Host "Build complete: $JAR_FILE" -ForegroundColor Cyan

# 2. Upload
Write-Host "`n[2/4] Uploading files to server..." -ForegroundColor Yellow
Write-Host "Checking/Creating remote directory: $REMOTE_PATH"
ssh -i $SSH_KEY $SERVER "mkdir -p $REMOTE_PATH"
scp -i $SSH_KEY $JAR_FILE "${SERVER}:${REMOTE_PATH}/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Upload failed!" -ForegroundColor Red
    exit 1
}

# 3. Check service existence
Write-Host "`n[3/4] Checking service..." -ForegroundColor Yellow
$serviceCheck = ssh -i $SSH_KEY $SERVER "systemctl list-unit-files | grep $SERVICE_NAME"
if (-not $serviceCheck) {
    Write-Host "Service not found. Running setup-service-admin.ps1..." -ForegroundColor Yellow
    $setupScript = Join-Path $PSScriptRoot "setup-service-admin.ps1"
    if (Test-Path $setupScript) {
        & $setupScript
    } else {
        Write-Host "setup-service-admin.ps1 not found! Please run it first." -ForegroundColor Red
        exit 1
    }
}

# 4. Restart service
Write-Host "`n[4/4] Restarting service..." -ForegroundColor Yellow
ssh -i $SSH_KEY $SERVER "sudo systemctl restart $SERVICE_NAME; sudo systemctl status $SERVICE_NAME --no-pager"

Write-Host "`n=== Deployment Complete ===" -ForegroundColor Green
