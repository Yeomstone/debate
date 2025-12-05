# Debate Swap Setup Script (PowerShell)
# 사용법: .\setup-swap.ps1

$SSH_KEY = Join-Path $PSScriptRoot "private_info\AWS\debate2025.pem"
$SERVER = "ubuntu@13.209.254.24"

Write-Host "=== Debate Swap Setup Start ===" -ForegroundColor Green

# 스왑 파일 생성 및 설정 명령어
$commands = @(
    # 1. 기존 스왑 확인 및 끄기 (혹시 있다면)
    "sudo swapoff -a",
    
    # 2. 2GB 스왑 파일 생성 (dd 대신 fallocate 사용이 더 빠름)
    "sudo fallocate -l 2G /swapfile",
    
    # 3. 권한 설정 (보안)
    "sudo chmod 600 /swapfile",
    
    # 4. 스왑 영역 설정
    "sudo mkswap /swapfile",
    
    # 5. 스왑 활성화
    "sudo swapon /swapfile",
    
    # 6. 재부팅 후에도 유지되도록 /etc/fstab 등록
    "if ! grep -q '/swapfile' /etc/fstab; then echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab; fi",
    
    # 7. 확인
    "free -h"
)
$commandString = $commands -join "; "

Write-Host "`n[1/1] Creating 2GB Swap file..." -ForegroundColor Yellow
ssh -i $SSH_KEY $SERVER $commandString

if ($LASTEXITCODE -ne 0) {
    Write-Host "Swap setup failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Swap Setup Complete ===" -ForegroundColor Green
