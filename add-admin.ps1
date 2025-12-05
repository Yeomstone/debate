# 관리자 계정 추가 스크립트
# 사용법: .\add-admin.ps1
# 
# 예시:
#   .\add-admin.ps1
#   아이디: teamlead
#   비밀번호: Team1234!
#   이름: 팀장

$SSH_KEY = Join-Path $PSScriptRoot "private_info\AWS\debate2025.pem"
$SERVER = "ubuntu@13.209.254.24"

Write-Host "=== 관리자 계정 추가 ===" -ForegroundColor Green

# 입력 받기
$adminId = Read-Host "아이디"
$password = Read-Host "비밀번호"
$name = Read-Host "이름"

# SQL 파일 생성 (임시)
$sqlFile = Join-Path $env:TEMP "add_admin_temp.sql"

# BCrypt 해시 생성을 위해 서버에서 Spring의 PasswordEncoder 사용
# 간단히 하기 위해 고정 해시 사용 (실제로는 API 호출 권장)
$sqlContent = @"
-- 관리자 추가: $name ($adminId)
INSERT INTO admins (admin_id, password, name, role, status, created_at, updated_at) 
VALUES ('$adminId', '`$2a`$10`$dDJ3SW6W3A0OJq1EQ0p4IewDEn7SBkKZPVHfYMl4aZnWZdGKdqlRC', '$name', 'ADMIN', 'ACTIVE', NOW(), NOW());
"@

# 주의: 이 방식은 모든 계정이 같은 비밀번호(Admin123!)를 가짐
# 실제로는 각자 로그인 후 비밀번호 변경 필요

Write-Host "`n[!] 주의: 이 방식으로 추가하면 초기 비밀번호가 'Admin123!' 입니다." -ForegroundColor Yellow
Write-Host "    팀원들이 로그인 후 직접 비밀번호를 변경해야 합니다." -ForegroundColor Yellow

$confirm = Read-Host "`n계속 하시겠습니까? (y/n)"
if ($confirm -ne "y") {
    Write-Host "취소되었습니다." -ForegroundColor Red
    exit 0
}

$sqlContent | Out-File -FilePath $sqlFile -Encoding UTF8

# 업로드 및 실행
scp -i $SSH_KEY $sqlFile "${SERVER}:/tmp/add_admin.sql"
ssh -i $SSH_KEY $SERVER "sudo mysql debate_db < /tmp/add_admin.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n=== 계정 추가 완료 ===" -ForegroundColor Green
    Write-Host "아이디: $adminId" -ForegroundColor Cyan
    Write-Host "비밀번호: Admin123! (변경 필요)" -ForegroundColor Cyan
} else {
    Write-Host "계정 추가 실패!" -ForegroundColor Red
}

# 임시 파일 삭제
Remove-Item $sqlFile -ErrorAction SilentlyContinue
