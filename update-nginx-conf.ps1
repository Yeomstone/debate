
$SSH_KEY = Join-Path $PSScriptRoot "private_info\AWS\debate2025.pem"
$SERVER = "ubuntu@13.209.254.24"
$NGINX_CONF = Join-Path $PSScriptRoot "nginx_debate.conf"
$REMOTE_CONF_PATH = "/tmp/debate_fixed"

# Write-Host to show progress
Write-Host "Uploading new Nginx config..."
scp -i $SSH_KEY $NGINX_CONF "${SERVER}:${REMOTE_CONF_PATH}"

if ($LASTEXITCODE -ne 0) {
    Write-Host "SCP failed" -ForegroundColor Red
    exit 1
}

Write-Host "Applying config and reloading Nginx..."
ssh -i $SSH_KEY $SERVER "sudo mv ${REMOTE_CONF_PATH} /etc/nginx/sites-available/debate && sudo nginx -t && sudo systemctl reload nginx"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Nginx reload failed" -ForegroundColor Red
    exit 1
}

Write-Host "Success! Nginx configuration updated." -ForegroundColor Green
