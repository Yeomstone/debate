# Debate Database Setup Script (PowerShell)
# Usage: .\setup-db.ps1

$SSH_KEY = Join-Path $PSScriptRoot "private_info\AWS\debate2025.pem"
$SERVER = "ubuntu@13.209.254.24"
$SQL_SETUP = Join-Path $PSScriptRoot "DebateUser\DebateUserBackEnd\mysql_setup.sql"
$SQL_INSERT = Join-Path $PSScriptRoot "insert_categories.sql"
$REMOTE_TMP = "/tmp"

Write-Host "=== Debate Database Setup Start ===" -ForegroundColor Green

# 1. Install MySQL
Write-Host "`n[1/4] Checking MySQL installation..." -ForegroundColor Yellow
ssh -i $SSH_KEY $SERVER "if ! command -v mysql &> /dev/null; then sudo apt update && sudo apt install mysql-server -y; fi"

# 2. Upload SQL files
Write-Host "`n[2/4] Uploading SQL files..." -ForegroundColor Yellow
scp -i $SSH_KEY $SQL_SETUP "${SERVER}:${REMOTE_TMP}/mysql_setup.sql"
scp -i $SSH_KEY $SQL_INSERT "${SERVER}:${REMOTE_TMP}/insert_categories.sql"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Upload failed!" -ForegroundColor Red
    exit 1
}

# 3. Execute SQL
Write-Host "`n[3/4] Setting up database and user..." -ForegroundColor Yellow
# Run setup script (creates DB and user)
ssh -i $SSH_KEY $SERVER "sudo mysql < ${REMOTE_TMP}/mysql_setup.sql"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Database setup failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n[4/4] Inserting initial data..." -ForegroundColor Yellow
# Run insert script (needs to use the newly created user or root)
# Using root via sudo for simplicity to avoid password prompt issues in script
ssh -i $SSH_KEY $SERVER "sudo mysql debate_db < ${REMOTE_TMP}/insert_categories.sql"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Data insertion failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Database Setup Complete ===" -ForegroundColor Green
Write-Host "Please restart the backend service to apply changes:" -ForegroundColor Cyan
Write-Host ".\deploy-backend.ps1" -ForegroundColor Cyan
