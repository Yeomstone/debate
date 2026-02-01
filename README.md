<div align="center">

# 🗣️ Debate Platform

**실시간 토론 플랫폼** - 다양한 주제에 대해 찬성과 반대 의견을 나누고 소통하는 서비스

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-debate.me.kr-blue?style=for-the-badge)](https://debate.me.kr)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=for-the-badge&logo=spring-boot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)

</div>

---

## ✨ 주요 기능

<table>
<tr>
<td width="50%">

### 💬 토론 시스템
- 토론 주제 생성 및 기간 설정
- 찬성/반대 의견 작성
- 실시간 투표 및 결과 확인
- 댓글 및 대댓글 시스템

</td>
<td width="50%">

### 💡 실시간 채팅
- 토론별 채팅방
- WebSocket 기반 실시간 통신
- 토론 기간 동안 활성화

</td>
</tr>
<tr>
<td width="50%">

### 👤 사용자 기능
- 회원가입 / 로그인
- 프로필 관리
- 활동 내역 조회
- 좋아요 / 북마크

</td>
<td width="50%">

### 🛡️ 관리자 기능
- 사용자 관리
- 토론 콘텐츠 관리
- 신고 처리
- 카테고리 관리

</td>
</tr>
</table>

---

## 🛠️ 기술 스택

<div align="center">

| Category | Technologies |
|:--------:|:-------------|
| **Frontend** | ![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white) |
| **Backend** | ![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=flat-square&logo=spring-boot&logoColor=white) ![Java](https://img.shields.io/badge/Java_17-007396?style=flat-square&logo=openjdk&logoColor=white) ![JPA](https://img.shields.io/badge/JPA-59666C?style=flat-square&logo=hibernate&logoColor=white) |
| **Database** | ![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white) |
| **Security** | ![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white) ![Spring Security](https://img.shields.io/badge/Spring_Security-6DB33F?style=flat-square&logo=spring-security&logoColor=white) |
| **Realtime** | ![WebSocket](https://img.shields.io/badge/WebSocket-010101?style=flat-square&logo=socket.io&logoColor=white) |
| **Infra** | ![AWS EC2](https://img.shields.io/badge/AWS_EC2-FF9900?style=flat-square&logo=amazon-ec2&logoColor=white) ![Nginx](https://img.shields.io/badge/Nginx-009639?style=flat-square&logo=nginx&logoColor=white) |

</div>

---

## 📁 프로젝트 구조

```
Debate/
├── 📂 DebateUser/                 # 사용자용 애플리케이션
│   ├── 📂 DebateUserBackEnd/      # Spring Boot 백엔드
│   │   └── src/main/java/com/debate/
│   │       ├── controller/        # REST API 컨트롤러
│   │       ├── service/           # 비즈니스 로직
│   │       ├── repository/        # 데이터 접근 계층
│   │       ├── entity/            # JPA 엔티티
│   │       ├── dto/               # 데이터 전송 객체
│   │       └── config/            # 설정 클래스
│   │
│   └── 📂 DebateUserFrontEnd/     # React 프론트엔드
│       └── src/
│           ├── pages/             # 페이지 컴포넌트
│           ├── components/        # 재사용 컴포넌트
│           └── services/          # API 서비스
│
└── 📂 DebateAdmin/                # 관리자용 애플리케이션
    ├── 📂 DebateAdminBackEnd/     # Spring Boot 백엔드
    └── 📂 DebateAdminFrontEnd/    # React 프론트엔드
```

---

## 🚀 시작하기

### 사전 요구사항
- Java 17+
- Node.js 18+
- MySQL 8.0+

### 백엔드 실행
```bash
cd DebateUser/DebateUserBackEnd
./gradlew bootRun
```

### 프론트엔드 실행
```bash
cd DebateUser/DebateUserFrontEnd
npm install
npm run dev
```

---

## 📄 라이선스

이 프로젝트는 개인 포트폴리오 목적으로 제작되었습니다.

---

<div align="center">

**Made with ❤️ by [Yeomstone](https://github.com/Yeomstone)**

</div>
