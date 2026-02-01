# Debate Platform

실시간 토론 플랫폼입니다. 다양한 주제에 대해 찬성과 반대 의견을 나누고, 실시간 채팅으로 소통할 수 있습니다.

**배포 URL**: https://debate.me.kr

## 기술 스택

### Frontend
- React 18
- React Router (클라이언트 라우팅)
- CSS (커스텀 스타일링)

### Backend
- Java 17
- Spring Boot 3.x
- Spring Security + JWT 인증
- JPA/Hibernate
- WebSocket (실시간 채팅)

### Database
- MySQL 8.0

### Infra
- AWS EC2
- Nginx (리버스 프록시)

## 프로젝트 구조

```
Debate/
├── DebateUser/                    # 사용자용 애플리케이션
│   ├── DebateUserBackEnd/         # Spring Boot 백엔드
│   │   └── src/main/java/com/debate/
│   │       ├── controller/        # REST API
│   │       ├── service/           # 비즈니스 로직
│   │       ├── repository/        # 데이터 접근
│   │       ├── entity/            # JPA 엔티티
│   │       ├── dto/               # 요청/응답 DTO
│   │       └── config/            # 설정
│   │
│   └── DebateUserFrontEnd/        # React 프론트엔드
│       └── src/
│           ├── pages/             # 페이지 컴포넌트
│           ├── components/        # 재사용 컴포넌트
│           └── services/          # API 호출
│
└── DebateAdmin/                   # 관리자용 애플리케이션
    ├── DebateAdminBackEnd/        # 관리자 백엔드
    └── DebateAdminFrontEnd/       # 관리자 프론트엔드
```

## 주요 기능

### 토론 기능
- 토론 주제 생성 (기간 설정 가능)
- 찬성/반대 의견 작성
- 실시간 투표 및 결과 확인
- 토론 기간 동안 실시간 채팅

### 사용자 기능
- 회원가입/로그인
- 프로필 관리
- 댓글 및 대댓글
- 좋아요/북마크
- 활동 내역 조회

### 관리자 기능
- 사용자 관리
- 토론 콘텐츠 관리
- 신고 처리
- 카테고리 관리

## 실행 방법

### 백엔드
```bash
cd DebateUser/DebateUserBackEnd
./gradlew bootRun
```

### 프론트엔드
```bash
cd DebateUser/DebateUserFrontEnd
npm install
npm run dev
```
