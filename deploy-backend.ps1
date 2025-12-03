# DebateUserBackEnd Deployment Script (PowerShell)
# Usage: .\deploy-backend.ps1

$SSH_KEY = Join-Path $PSScriptRoot "private_info\AWS\debate2025.pem"
$SERVER = "ubuntu@13.209.254.24"
$BACKEND_DIR = Join-Path $PSScriptRoot "DebateUser\DebateUserBackEnd"
$JAR_FILE = "build\libs\debate-user-1.0.0.jar"
$REMOTE_PATH = "opt/debate/backend" # Relative path from home

Write-Host "=== DebateUserBackEnd Deployment Start ===" -ForegroundColor Green

# 1. Build
Write-Host "`n[1/4] Building project..." -ForegroundColor Yellow
Set-Location $BACKEND_DIR

# Use local Gradle
$GRADLE_BIN = Join-Path $PSScriptRoot "temp_gradle\gradle-8.5\bin\gradle.bat"

if (Test-Path $GRADLE_BIN) {
    & $GRADLE_BIN clean build -x test
} else {
    Write-Host "Local Gradle not found. Trying wrapper..." -ForegroundColor Yellow
    .\gradlew.bat clean build -x test
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

# Check JAR
$jarPath = Join-Path (Get-Location) $JAR_FILE
if (-not (Test-Path $jarPath)) {
    Write-Host "JAR file not found: $jarPath" -ForegroundColor Red
    exit 1
}

Write-Host "Build complete: $jarPath" -ForegroundColor Green

# 2. Upload to Server
Write-Host "`n[2/4] Uploading files to server..." -ForegroundColor Yellow

# Create remote directory if not exists
Write-Host "Checking/Creating remote directory: $REMOTE_PATH"
ssh -i $SSH_KEY $SERVER "mkdir -p $REMOTE_PATH"

scp -i $SSH_KEY $jarPath "${SERVER}:${REMOTE_PATH}/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Upload failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Upload complete" -ForegroundColor Green

# 3. Restart Service
Write-Host "`n[3/4] Restarting service on server..." -ForegroundColor Yellow
$restartOutput = ssh -i $SSH_KEY $SERVER "sudo systemctl restart debate-backend" 2>&1

if ($LASTEXITCODE -ne 0) {
    if ($restartOutput -match "not found") {
        Write-Host "Service not found. Running setup-service.ps1 automatically..." -ForegroundColor Yellow
        Set-Location $PSScriptRoot
        $SETUP_SCRIPT = ".\setup-service.ps1"
        if (Test-Path $SETUP_SCRIPT) {
            & $SETUP_SCRIPT
            if ($LASTEXITCODE -ne 0) {
                 Write-Host "Service setup failed!" -ForegroundColor Red
                 exit 1
            }
        } else {
             Write-Host "setup-service.ps1 not found! Please run it manually." -ForegroundColor Red
             exit 1
        }
    } else {
        Write-Host "Service restart failed!" -ForegroundColor Red
        Write-Host $restartOutput
        exit 1
    }
} else {
    Write-Host "Service restart complete" -ForegroundColor Green
}

# 4. Check Status
Write-Host "`n[4/4] Checking service status..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
ssh -i $SSH_KEY $SERVER "sudo systemctl status debate-backend --no-pager"

Write-Host "`n=== Deployment Complete ===" -ForegroundColor Green
Set-Location $PSScriptRoot
