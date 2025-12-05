# Debate Admin Backend Service Setup Script
# Usage: .\setup-service-admin.ps1

$SSH_KEY = Join-Path $PSScriptRoot "private_info\AWS\debate2025.pem"
$SERVER = "ubuntu@13.209.254.24"
$SERVICE_FILE = Join-Path $PSScriptRoot "debate-admin-backend.service"
$SERVICE_NAME = "debate-admin-backend"

Write-Host "=== Setting up Debate Admin Backend Service ===" -ForegroundColor Green

# 1. Upload service file
Write-Host "`n[1/3] Uploading service file..." -ForegroundColor Yellow
scp -i $SSH_KEY $SERVICE_FILE "${SERVER}:/tmp/${SERVICE_NAME}.service"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Upload failed!" -ForegroundColor Red
    exit 1
}

# 2. Register and start service
Write-Host "`n[2/3] Registering and starting service..." -ForegroundColor Yellow
$commands = @(
    "sudo mv /tmp/${SERVICE_NAME}.service /etc/systemd/system/",
    "sudo systemctl daemon-reload",
    "sudo systemctl enable ${SERVICE_NAME}",
    "sudo systemctl restart ${SERVICE_NAME}"
)
$commandString = $commands -join "; "
ssh -i $SSH_KEY $SERVER $commandString

# 3. Check status
Write-Host "`n[3/3] Checking service status..." -ForegroundColor Yellow
ssh -i $SSH_KEY $SERVER "sudo systemctl status ${SERVICE_NAME} --no-pager"

Write-Host "`n=== Setup Complete ===" -ForegroundColor Green
