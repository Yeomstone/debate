# 소셜 로그인 구현 가이드

카카오, 네이버, 구글, 인스타그램, 페이스북 간편 로그인 도입에 필요한 서류, 절차, 기술적 요구사항을 정리한 문서입니다.

---

## 목차

1. [카카오 로그인](#1-카카오-로그인-kakao-login)
2. [네이버 로그인](#2-네이버-로그인-naver-login)
3. [구글 로그인](#3-구글-로그인-google-sign-in)
4. [인스타그램 로그인](#4-인스타그램-로그인-instagram-login)
5. [페이스북 로그인](#5-페이스북-로그인-facebook-login)
6. [공통 요구사항](#공통으로-필요한-사항)
7. [체크리스트](#체크리스트)

---

## 1. 카카오 로그인 (Kakao Login)

### 필수 서류 및 정보

#### 1.1 사업자 관련 서류
- **사업자 등록증** (법인인 경우)
  - 사업자등록번호 확인
  - 사업자등록증 사본 (PDF 또는 이미지)
  - 형식: JPG, PNG, PDF
  - 크기: 10MB 이하

#### 1.2 신분증
- **대표자 신분증**
  - 주민등록증 또는 운전면허증 사본
  - 형식: JPG, PNG, PDF
  - 크기: 10MB 이하

#### 1.3 서비스 정보
- **서비스명**
  - 예: "토론 플랫폼", "Debate Platform"
  
- **서비스 URL**
  - 예: `https://yourdomain.com`
  - HTTPS 필수 (운영 환경)

- **서비스 로고 이미지**
  - 최소 크기: 200x200px
  - 권장 크기: 400x400px
  - 형식: PNG, JPG
  - 배경 투명 권장

- **서비스 약관 URL**
  - 예: `https://yourdomain.com/terms`
  - 웹사이트에 공개되어 있어야 함

- **개인정보 처리방침 URL**
  - 예: `https://yourdomain.com/privacy`
  - 웹사이트에 공개되어 있어야 함

#### 1.4 담당자 정보
- 담당자 이름
- 담당자 이메일 (비즈니스 이메일 권장)
- 담당자 전화번호
- 회사 주소

#### 1.5 Redirect URI
- **개발 환경**
  - `http://localhost:3000/auth/kakao/callback`
  - `http://localhost:8080/auth/kakao/callback`

- **운영 환경**
  - `https://yourdomain.com/auth/kakao/callback`
  - `https://api.yourdomain.com/auth/kakao/callback`

### 신청 절차

1. **카카오 개발자 콘솔 접속**
   - URL: https://developers.kakao.com
   - 카카오 계정으로 로그인

2. **내 애플리케이션 만들기**
   - 애플리케이션 이름 입력
   - 사업자명 입력

3. **앱 키 확인**
   - REST API 키 (Client ID로 사용)
   - 앱 키는 보안이 중요하므로 안전하게 관리

4. **플랫폼 설정**
   - Web 플랫폼 등록
   - 사이트 도메인 등록 (예: `yourdomain.com`)

5. **카카오 로그인 활성화**
   - 제품 설정 > 카카오 로그인 > 활성화 설정

6. **Redirect URI 등록**
   - Redirect URI에 위에서 준비한 URI 등록
   - 여러 개 등록 가능

7. **동의 항목 설정**
   - 필수 동의: 닉네임, 카카오계정(이메일)
   - 선택 동의: 프로필 사진, 성별, 연령대 등
   - 최소한의 정보만 요청하는 것이 좋음

8. **앱 심사 제출** (필요 시)
   - 상업적 서비스의 경우 심사 필요
   - 심사 기간: 1-3일

### 비용
- **무료**
- 일일 사용량 제한 있음 (기본적으로 충분한 수준)

### API 문서
- 공식 문서: https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api

---

## 2. 네이버 로그인 (Naver Login)

### 필수 서류 및 정보

#### 2.1 사업자 관련 서류
- **사업자 등록증**
  - 사업자등록번호
  - 사업자등록증 사본 (PDF 또는 이미지)
  - 형식: JPG, PNG, PDF

#### 2.2 신분증
- **대표자 신분증**
  - 주민등록증 또는 운전면허증 사본
  - 형식: JPG, PNG, PDF

#### 2.3 서비스 정보
- **서비스명**
  - 예: "토론 플랫폼"

- **서비스 URL**
  - 예: `https://yourdomain.com`
  - HTTPS 필수

- **서비스 로고**
  - 최소 크기: 200x200px
  - 권장 크기: 400x400px
  - 형식: PNG, JPG

- **서비스 약관 URL**
  - 예: `https://yourdomain.com/terms`

- **개인정보 처리방침 URL**
  - 예: `https://yourdomain.com/privacy`

- **서비스 소개**
  - 500자 이내
  - 서비스의 목적과 기능 설명

#### 2.4 담당자 정보
- 담당자 이름
- 담당자 이메일
- 담당자 전화번호
- 회사 주소

#### 2.5 Redirect URI
- **개발 환경**
  - `http://localhost:3000/auth/naver/callback`

- **운영 환경**
  - `https://yourdomain.com/auth/naver/callback`

### 신청 절차

1. **네이버 개발자 센터 접속**
   - URL: https://developers.naver.com
   - 네이버 계정으로 로그인

2. **애플리케이션 등록**
   - 애플리케이션 이름 입력
   - 사용 API 선택: 네이버 로그인

3. **Client ID, Client Secret 발급**
   - 등록 완료 후 즉시 발급
   - Client Secret은 한 번만 표시되므로 안전하게 보관

4. **서비스 URL 등록**
   - 서비스 URL 입력
   - 여러 개 등록 가능

5. **Callback URL 등록**
   - 위에서 준비한 Redirect URI 등록

6. **API 이용 신청서 작성 및 제출**
   - 서류 업로드 (사업자등록증, 신분증)
   - 서비스 정보 입력
   - 담당자 정보 입력

7. **심사 대기**
   - 심사 기간: 1-3일
   - 승인 후 사용 가능

### 비용
- **무료**
- 일일 사용량 제한 있음

### API 문서
- 공식 문서: https://developers.naver.com/docs/login/overview/

---

## 3. 구글 로그인 (Google Sign-In)

### 필수 서류 및 정보

#### 3.1 사업자 관련 서류
- **사업자 등록증** (법인인 경우)
  - 개인 개발자도 가능하나, 상업적 서비스는 사업자 등록 권장
  - 형식: PDF, 이미지

#### 3.2 서비스 정보
- **서비스명**
  - 예: "토론 플랫폼"

- **서비스 URL**
  - 예: `https://yourdomain.com`
  - HTTPS 필수

- **서비스 로고**
  - 최소 크기: 120x120px
  - 권장 크기: 192x192px
  - 형식: PNG, JPG
  - 배경 투명 권장

- **서비스 약관 URL**
  - 예: `https://yourdomain.com/terms`

- **개인정보 처리방침 URL**
  - 예: `https://yourdomain.com/privacy`

- **서비스 홈페이지 URL**
  - 예: `https://yourdomain.com`

#### 3.3 OAuth 동의 화면 정보
- **앱 이름**
  - 사용자에게 표시될 앱 이름

- **사용자 지원 이메일**
  - 사용자 문의 시 사용할 이메일

- **개발자 연락처 정보**
  - 개발자 이메일 주소

- **앱 로고**
  - 120x120px 이상

- **앱 도메인**
  - 예: `yourdomain.com`

- **승인된 도메인**
  - 예: `yourdomain.com`

#### 3.4 Redirect URI
- **개발 환경**
  - `http://localhost:3000/auth/google/callback`

- **운영 환경**
  - `https://yourdomain.com/auth/google/callback`

### 신청 절차

1. **Google Cloud Console 접속**
   - URL: https://console.cloud.google.com
   - Google 계정으로 로그인

2. **프로젝트 생성**
   - 새 프로젝트 생성 또는 기존 프로젝트 선택
   - 프로젝트 이름 입력

3. **OAuth 동의 화면 구성**
   - 사용자 유형 선택 (외부)
   - 앱 정보 입력
   - 개발자 연락처 정보 입력
   - 범위 추가 (이메일, 프로필 등)

4. **OAuth 2.0 클라이언트 ID 생성**
   - API 및 서비스 > 사용자 인증 정보
   - 애플리케이션 유형: 웹 애플리케이션
   - 이름 입력
   - 승인된 리디렉션 URI 등록

5. **Client ID, Client Secret 확인**
   - 생성 후 즉시 확인 가능
   - Client Secret은 안전하게 보관

6. **검증 상태 확인**
   - 공개 앱의 경우 Google 검증 필요
   - 검증되지 않은 앱은 경고 표시

### 비용
- **무료**
- 일일 사용량 제한 있음 (충분한 수준)

### API 문서
- 공식 문서: https://developers.google.com/identity/protocols/oauth2

---

## 4. 인스타그램 로그인 (Instagram Login)

### 필수 서류 및 정보

> **참고**: 인스타그램 로그인은 Facebook 개발자 플랫폼을 통해 관리됩니다.

#### 4.1 사업자 관련 서류
- **사업자 등록증** (법인인 경우)
  - 사업자등록번호
  - 사업자등록증 사본
  - 형식: PDF, 이미지

#### 4.2 신분증
- **대표자 신분증**
  - 주민등록증 또는 운전면허증 사본
  - 형식: PDF, 이미지

#### 4.3 서비스 정보
- **서비스명**
  - 예: "토론 플랫폼"

- **서비스 URL**
  - 예: `https://yourdomain.com`
  - HTTPS 필수

- **서비스 로고**
  - 최소 크기: 1024x1024px
  - 권장 크기: 1024x1024px
  - 형식: PNG, JPG
  - 배경 투명 권장

- **서비스 약관 URL**
  - 예: `https://yourdomain.com/terms`

- **개인정보 처리방침 URL**
  - 예: `https://yourdomain.com/privacy`

- **개인정보 처리방침**
  - 웹사이트에 공개되어 있어야 함
  - Facebook 정책 준수 필요

#### 4.4 담당자 정보
- 담당자 이름
- 담당자 이메일
- 담당자 전화번호
- 회사 주소

#### 4.5 Redirect URI
- **개발 환경**
  - `http://localhost:3000/auth/instagram/callback`

- **운영 환경**
  - `https://yourdomain.com/auth/instagram/callback`

### 신청 절차

1. **Facebook 개발자 페이지 접속**
   - URL: https://developers.facebook.com
   - Facebook 계정으로 로그인

2. **애플리케이션 생성**
   - 내 앱 > 앱 만들기
   - 앱 유형 선택 (소비자 또는 비즈니스)
   - 앱 이름 입력
   - 앱 연락처 이메일 입력

3. **Instagram Basic Display 제품 추가**
   - 제품 추가 > Instagram Basic Display
   - 또는 Instagram Graph API (비즈니스 계정용)

4. **앱 설정**
   - 기본 설정에서 앱 도메인 등록
   - 사이트 URL 등록

5. **OAuth 리디렉션 URI 등록**
   - Instagram Basic Display 설정
   - 유효한 OAuth 리디렉션 URI 등록

6. **앱 ID 및 앱 시크릿 확인**
   - 앱 ID (Client ID로 사용)
   - 앱 시크릿 (Client Secret)
   - 안전하게 보관

7. **앱 심사 제출** (필요 시)
   - 상업적 서비스의 경우 심사 필요
   - Instagram Basic Display 권한 요청
   - 심사 기간: 1-7일

### 비용
- **무료**
- 일일 사용량 제한 있음

### 주의사항
- Instagram Basic Display는 개인 계정용
- 비즈니스 계정의 경우 Instagram Graph API 사용
- Facebook 정책을 엄격히 준수해야 함

### API 문서
- 공식 문서: https://developers.facebook.com/docs/instagram-basic-display-api

---

## 5. 페이스북 로그인 (Facebook Login)

### 필수 서류 및 정보

#### 5.1 사업자 관련 서류
- **사업자 등록증** (법인인 경우)
  - 사업자등록번호
  - 사업자등록증 사본
  - 형식: PDF, 이미지

#### 5.2 신분증
- **대표자 신분증**
  - 주민등록증 또는 운전면허증 사본
  - 형식: PDF, 이미지

#### 5.3 서비스 정보
- **서비스명**
  - 예: "토론 플랫폼"

- **서비스 URL**
  - 예: `https://yourdomain.com`
  - HTTPS 필수

- **서비스 로고**
  - 최소 크기: 1024x1024px
  - 권장 크기: 1024x1024px
  - 형식: PNG, JPG
  - 배경 투명 권장

- **서비스 약관 URL**
  - 예: `https://yourdomain.com/terms`

- **개인정보 처리방침 URL**
  - 예: `https://yourdomain.com/privacy`
  - **중요**: Facebook 정책을 준수해야 함

- **개인정보 처리방침**
  - Facebook 데이터 사용 정책 준수
  - 사용자 데이터 처리 방식 명시

#### 5.4 담당자 정보
- 담당자 이름
- 담당자 이메일
- 담당자 전화번호
- 회사 주소

#### 5.5 Redirect URI
- **개발 환경**
  - `http://localhost:3000/auth/facebook/callback`

- **운영 환경**
  - `https://yourdomain.com/auth/facebook/callback`

### 신청 절차

1. **Facebook 개발자 페이지 접속**
   - URL: https://developers.facebook.com
   - Facebook 계정으로 로그인

2. **애플리케이션 생성**
   - 내 앱 > 앱 만들기
   - 앱 유형 선택 (소비자 또는 비즈니스)
   - 앱 이름 입력
   - 앱 연락처 이메일 입력

3. **Facebook Login 제품 추가**
   - 제품 추가 > Facebook 로그인
   - 설정 버튼 클릭

4. **플랫폼 추가**
   - 웹 플랫폼 추가
   - 사이트 URL 입력

5. **OAuth 리디렉션 URI 등록**
   - Facebook 로그인 설정
   - 유효한 OAuth 리디렉션 URI 등록
   - 예: `https://yourdomain.com/auth/facebook/callback`

6. **앱 ID 및 앱 시크릿 확인**
   - 앱 설정 > 기본 설정
   - 앱 ID (Client ID로 사용)
   - 앱 시크릿 (Client Secret)
   - **중요**: 앱 시크릿은 한 번만 표시되므로 안전하게 보관

7. **권한 및 기능 설정**
   - 필요한 권한 선택 (이메일, 공개 프로필 등)
   - 최소한의 권한만 요청하는 것이 좋음

8. **앱 심사 제출** (필요 시)
   - 상업적 서비스의 경우 심사 필요
   - Facebook 로그인 권한 요청
   - 심사 기간: 1-7일
   - 심사 전에는 개발자 및 테스터만 사용 가능

### 비용
- **무료**
- 일일 사용량 제한 있음

### 주의사항
- Facebook 정책을 엄격히 준수해야 함
- 사용자 데이터 보호 정책 준수 필수
- 정책 위반 시 앱 비활성화 가능
- 정기적으로 Facebook 정책 변경사항 확인 필요

### API 문서
- 공식 문서: https://developers.facebook.com/docs/facebook-login

---

## 공통으로 필요한 사항

### 1. 법적 문서

#### 1.1 개인정보 처리방침 (필수)
- **위치**: 웹사이트 하단 링크 또는 별도 페이지
- **URL 예시**: `https://yourdomain.com/privacy`
- **포함 내용**:
  - 수집하는 개인정보 항목
  - 개인정보 수집 및 이용 목적
  - 개인정보 보유 및 이용 기간
  - 개인정보 제3자 제공 (소셜 로그인 제공자)
  - 개인정보 처리 위탁
  - 이용자 권리 및 행사 방법
  - 개인정보 보호책임자 연락처

#### 1.2 서비스 이용약관 (필수)
- **위치**: 웹사이트 하단 링크 또는 별도 페이지
- **URL 예시**: `https://yourdomain.com/terms`
- **포함 내용**:
  - 서비스 이용 조건
  - 이용자 의무
  - 서비스 제공 및 변경
  - 지적재산권
  - 면책 조항

### 2. 기술적 요구사항

#### 2.1 HTTPS 도메인
- **운영 환경**: HTTPS 필수
- **SSL 인증서**: 유효한 SSL 인증서 필요
- **Let's Encrypt**: 무료 SSL 인증서 사용 가능

#### 2.2 안정적인 서버 환경
- 서버 가동률 99% 이상 권장
- 로드 밸런싱 (선택사항)
- 백업 시스템

#### 2.3 Redirect URI 관리
- 개발 환경과 운영 환경 분리
- 여러 Redirect URI 등록 가능
- URI는 정확히 일치해야 함

### 3. 데이터베이스 스키마 확장

#### 3.1 사용자 테이블 확장 예시
```sql
-- 기존 User 테이블에 추가할 컬럼
ALTER TABLE users ADD COLUMN social_provider VARCHAR(20) NULL COMMENT '소셜 로그인 제공자 (kakao, naver, google, instagram, facebook)';
ALTER TABLE users ADD COLUMN social_id VARCHAR(255) NULL COMMENT '소셜 로그인 사용자 ID';
ALTER TABLE users ADD COLUMN social_email VARCHAR(255) NULL COMMENT '소셜 로그인 이메일';
ALTER TABLE users ADD UNIQUE KEY unique_social (social_provider, social_id);
```

#### 3.2 데이터 통합 관리
- 기존 이메일 로그인과 소셜 로그인 통합
- 동일 이메일로 여러 소셜 로그인 연동 가능하도록 설계
- 소셜 로그인 타입별 식별자 저장

### 4. 보안 고려사항

#### 4.1 OAuth 토큰 관리
- Client ID/Secret은 환경 변수로 관리
- 절대 코드에 하드코딩하지 않음
- `.env` 파일 사용 (프로덕션에서는 환경 변수)

#### 4.2 CSRF 방지
- State 파라미터 사용
- 세션 기반 state 검증
- 랜덤 문자열 생성 및 검증

#### 4.3 사용자 데이터 보호
- 최소한의 정보만 요청
- 불필요한 권한 요청 금지
- 사용자 동의 명시

---

## 예상 소요 시간

| 플랫폼     | 서류 준비 | 신청 및 심사 | 총 소요 시간 |
|------------|----------|------------|------------|
| 카카오     | 1-2일    | 1-3일      | 2-5일      |
| 네이버     | 1-2일    | 1-3일      | 2-5일      |
| 구글       | 1일      | 즉시~1일   | 1-2일      |
| 인스타그램 | 1-2일    | 1-7일      | 2-9일      |
| 페이스북   | 1-2일    | 1-7일      | 2-9일      |

> **참고**: 심사 기간은 플랫폼 정책 및 앱 복잡도에 따라 달라질 수 있습니다.

---

## 체크리스트

### 사전 준비

#### 서류 준비
- [ ] 사업자 등록증 준비 (법인인 경우)
- [ ] 대표자 신분증 준비
- [ ] 서비스 로고 이미지 제작 (각 플랫폼별 요구사항 확인)
- [ ] 개인정보 처리방침 작성 및 게시
- [ ] 서비스 이용약관 작성 및 게시
- [ ] 담당자 연락처 정리

#### 기술 준비
- [ ] HTTPS 도메인 확보
- [ ] SSL 인증서 설치
- [ ] 서버 환경 안정화
- [ ] Redirect URI 결정 (개발/운영 환경)

### 개발 준비

#### 백엔드
- [ ] OAuth 라이브러리 선택
  - Spring Security OAuth2 (Java/Spring Boot)
  - Passport.js (Node.js)
  - 기타 프레임워크별 OAuth 라이브러리
- [ ] 데이터베이스 스키마 설계
  - 소셜 로그인 사용자 식별자 저장
  - 소셜 로그인 타입 저장
  - 기존 로그인과 통합 관리
- [ ] OAuth 인증 플로우 구현
  - 인증 요청
  - 콜백 처리
  - 토큰 교환
  - 사용자 정보 조회
- [ ] JWT 토큰 생성 (기존 시스템과 통합)

#### 프론트엔드
- [ ] 소셜 로그인 버튼 UI 준비
  - 각 플랫폼별 브랜드 가이드라인 준수
  - 버튼 디자인 및 배치
- [ ] OAuth 리디렉션 처리
- [ ] 로그인 상태 관리
- [ ] 에러 처리

### 신청 및 설정

#### 각 플랫폼별 신청
- [ ] 카카오 개발자 콘솔에서 앱 생성
- [ ] 네이버 개발자 센터에서 앱 등록
- [ ] Google Cloud Console에서 프로젝트 생성
- [ ] Facebook 개발자에서 앱 생성 (인스타그램/페이스북)

#### 설정 완료
- [ ] Client ID/Secret 발급 및 확인
- [ ] Redirect URI 등록
- [ ] 동의 항목 설정
- [ ] 앱 심사 제출 (필요 시)

### 배포 및 운영

#### 보안 설정
- [ ] Client ID/Secret 환경 변수로 관리
- [ ] `.env` 파일 `.gitignore`에 추가
- [ ] 프로덕션 환경 변수 설정

#### 테스트
- [ ] 개발 환경에서 각 플랫폼별 로그인 테스트
- [ ] 콜백 처리 테스트
- [ ] 사용자 정보 조회 테스트
- [ ] 기존 로그인과 통합 테스트

#### 배포
- [ ] 운영 환경 배포
- [ ] 운영 환경에서 로그인 테스트
- [ ] 모니터링 설정

---

## 추가 참고사항

### 1. 개인 개발자 vs 법인
- **개인 개발자**: 대부분의 플랫폼에서 가능하나, 일부 제한 있음
- **법인**: 상업적 서비스의 경우 사업자 등록 권장
- **권장**: 상업적 서비스는 사업자 등록 후 신청

### 2. 플랫폼별 정책
- 각 플랫폼의 정책이 자주 변경될 수 있음
- 정기적으로 정책 변경사항 확인 필요
- 정책 위반 시 앱 비활성화 가능

### 3. 사용자 경험
- 소셜 로그인은 편의성을 제공하지만, 필수는 아님
- 기존 이메일 로그인도 유지하는 것이 좋음
- 로그인 실패 시 대체 로그인 방법 제공

### 4. 데이터 통합
- 동일 사용자가 여러 소셜 로그인으로 가입할 수 있음
- 이메일 기반으로 계정 통합 고려
- 사용자에게 계정 연동 기능 제공 (선택사항)

### 5. 모니터링 및 로깅
- 소셜 로그인 성공/실패 로그 기록
- 에러 모니터링 설정
- 사용자 통계 수집

### 6. 브랜드 가이드라인
- 각 플랫폼별 브랜드 가이드라인 준수
- 로고 및 버튼 디자인 가이드 확인
- 플랫폼별 공식 문서 참조

---

## 플랫폼별 공식 문서 링크

- **카카오**: https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api
- **네이버**: https://developers.naver.com/docs/login/overview/
- **구글**: https://developers.google.com/identity/protocols/oauth2
- **인스타그램**: https://developers.facebook.com/docs/instagram-basic-display-api
- **페이스북**: https://developers.facebook.com/docs/facebook-login

---

## 문의 및 지원

각 플랫폼별 개발자 지원 센터를 통해 문의할 수 있습니다.

- **카카오**: https://developers.kakao.com/support
- **네이버**: https://developers.naver.com/support
- **구글**: https://support.google.com/cloud
- **페이스북**: https://developers.facebook.com/support

---

**마지막 업데이트**: 2024년 12월

