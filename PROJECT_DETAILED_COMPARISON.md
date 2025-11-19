# Argu vs Debate 프로젝트 상세 비교 분석

## 📋 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [디렉토리 구조 비교](#디렉토리-구조-비교)
3. [백엔드 비교](#백엔드-비교)
4. [프론트엔드 비교](#프론트엔드-비교)
5. [목업(Mockup) 비교](#목업mockup-비교)
6. [주요 변경 사항](#주요-변경-사항)
7. [기술 스택 비교](#기술-스택-비교)
8. [파일명 및 네이밍 변경](#파일명-및-네이밍-변경)

---

## 프로젝트 개요

### Argu 프로젝트
- **프로젝트명**: 논쟁(Argu) 플랫폼
- **목적**: 사용자들이 논쟁 주제를 작성하고 토론할 수 있는 플랫폼
- **위치**: `D:\vs\Argu`

### Debate 프로젝트
- **프로젝트명**: 토론(Debate) 플랫폼
- **목적**: 사용자들이 토론 주제를 작성하고 토론할 수 있는 플랫폼
- **위치**: `D:\vs\Debate`

### 핵심 차이점
- **용어 변경**: "논쟁(Argu)" → "토론(Debate)"
- **네이밍 컨벤션**: 모든 `argu` 관련 네이밍이 `debate`로 변경됨
- **기능적 차이**: 없음 (동일한 기능 제공)

---

## 디렉토리 구조 비교

### 공통 구조
두 프로젝트 모두 동일한 구조를 가지고 있습니다:

```
프로젝트 루트/
├── [프로젝트명]Admin/
│   ├── [프로젝트명]AdminBackEnd/    # 관리자 백엔드 (Spring Boot)
│   └── [프로젝트명]AdminFrontEnd/   # 관리자 프론트엔드 (React)
├── [프로젝트명]User/
│   ├── [프로젝트명]UserBackEnd/     # 사용자 백엔드 (Spring Boot)
│   └── [프로젝트명]UserFrontEnd/    # 사용자 프론트엔드 (React)
├── Files/                            # 업로드된 파일 저장소
├── mockup/                           # HTML 목업
└── README.md                         # 프로젝트 문서
```

### 차이점

| 항목 | Argu | Debate |
|------|------|--------|
| 루트 디렉토리 | `ArguAdmin`, `ArguUser` | `DebateAdmin`, `DebateUser` |
| 목업 파일명 | `argu-*.html` | `debate-*.html` |
| 이미지 파일 | `ARGU.png` | `DEBATE.png` (또는 `ARGU.png` 남아있음) |

---

## 백엔드 비교

### 1. 프로젝트 설정 (build.gradle)

#### 공통점
- Spring Boot 3.2.0
- Java 17
- 동일한 의존성 버전
- 동일한 빌드 설정

#### 차이점

| 항목 | Argu | Debate |
|------|------|--------|
| **group** | `com.argu` | `com.debate` |
| **주석** | "논쟁 플랫폼" | "토론 플랫폼" |

**예시:**
```gradle
// Argu
group = 'com.argu'
// 논쟁 플랫폼 사용자 백엔드 프로젝트

// Debate
group = 'com.debate'
// 토론 플랫폼 사용자 백엔드 프로젝트
```

### 2. 패키지 구조

#### Argu 프로젝트
```
com.argu
├── ArguUserApplication.java
├── controller/
│   ├── ArguController.java
│   ├── ArguOpinionController.java
│   └── ...
├── service/
│   ├── ArguService.java
│   ├── ArguOpinionService.java
│   └── ...
├── repository/
│   ├── ArguRepository.java
│   ├── ArguOpinionRepository.java
│   └── ...
└── entity/
    ├── Argu.java
    ├── ArguOpinion.java
    └── ...
```

#### Debate 프로젝트
```
com.debate
├── DebateUserApplication.java
├── controller/
│   ├── DebateController.java
│   ├── OpinionController.java
│   └── ...
├── service/
│   ├── DebateService.java
│   ├── DebateOpinionService.java
│   └── ...
├── repository/
│   ├── DebateRepository.java
│   ├── DebateOpinionRepository.java
│   └── ...
└── entity/
    ├── Debate.java
    ├── DebateOpinion.java
    └── ...
```

### 3. 엔티티 클래스 비교

#### 주요 엔티티 변경

| Argu | Debate | 변경 내용 |
|------|--------|----------|
| `Argu` | `Debate` | 클래스명, 테이블명 변경 |
| `ArguOpinion` | `DebateOpinion` | 클래스명 변경 |
| `ArguStatus` | `DebateStatus` | 열거형 이름 변경 |

#### 엔티티 상세 비교

**Argu.java vs Debate.java**
```java
// Argu
@Entity
@Table(name = "argu")
public class Argu {
    @Comment("논쟁 ID")
    private Long id;
    
    @Comment("논쟁 작성자 ID")
    private User user;
    
    @Comment("논쟁 제목")
    private String title;
    
    // ...
    public enum ArguStatus {
        SCHEDULED, ACTIVE, ENDED
    }
}

// Debate
@Entity
@Table(name = "debate")
public class Debate {
    @Comment("토론 ID")
    private Long id;
    
    @Comment("토론 작성자 ID")
    private User user;
    
    @Comment("토론 제목")
    private String title;
    
    // ...
    public enum DebateStatus {
        SCHEDULED, ACTIVE, ENDED
    }
}
```

**주요 차이점:**
- 테이블명: `argu` → `debate`
- 외래키 제약조건명: `fk_argu_user` → `fk_debate_user`
- 주석: "논쟁" → "토론"
- 열거형명: `ArguStatus` → `DebateStatus`

### 4. 컨트롤러 비교

| Argu | Debate | 엔드포인트 |
|------|--------|-----------|
| `ArguController` | `DebateController` | `/api/argu` → `/api/debate` |
| `ArguOpinionController` | `OpinionController` | `/api/argu/{id}/opinions` → `/api/debate/{id}/opinions` |

### 5. 서비스 및 리포지토리 비교

| Argu | Debate |
|------|--------|
| `ArguService` | `DebateService` |
| `ArguRepository` | `DebateRepository` |
| `ArguOpinionService` | `DebateOpinionService` |
| `ArguOpinionRepository` | `DebateOpinionRepository` |

### 6. DTO 비교

| Argu | Debate |
|------|--------|
| `CreateArguRequest` | `CreateDebateRequest` |
| `UpdateArguRequest` | `UpdateDebateRequest` |
| `ArguResponse` | `DebateResponse` |

---

## 프론트엔드 비교

### 1. 프로젝트 설정 (package.json)

#### 공통점
- React 18.2.0
- 동일한 의존성 버전
- 동일한 스크립트 설정

#### 차이점

| 항목 | Argu | Debate |
|------|------|--------|
| **name** | `argu-user-frontend` | `debate-user-frontend` |
| **description** | "논쟁 플랫폼 사용자 프론트엔드" | "토론 플랫폼 사용자 프론트엔드" |

### 2. 페이지 컴포넌트 비교

#### 사용자 프론트엔드

| Argu | Debate | 경로 |
|------|--------|------|
| `ArguListPage.jsx` | `DebateListPage.jsx` | `/debate` |
| `ArguDetailPage.jsx` | `DebateDetailPage.jsx` | `/debate/:id` |
| `ArguCreatePage.jsx` | `DebateCreatePage.jsx` | `/debate/create` |
| `ArguEditPage.jsx` | `DebateEditPage.jsx` | `/debate/:id/edit` |

#### 관리자 프론트엔드

| Argu | Debate |
|------|--------|
| `ArguPage.jsx` | `DebatePage.jsx` |

### 3. 컴포넌트 비교

| Argu | Debate |
|------|--------|
| `components/argu/ArguCard.jsx` | `components/debate/DebateCard.jsx` |
| `components/argu/ArguCard.css` | `components/debate/DebateCard.css` |

### 4. 서비스 파일 비교

| Argu | Debate |
|------|--------|
| `services/arguService.js` | `services/debateService.js` |
| `services/opinionService.js` | `services/opinionService.js` (동일) |

### 5. 라우팅 비교

**Argu 프로젝트:**
```jsx
<Route path="/argu" element={<ArguListPage />} />
<Route path="/argu/create" element={<ArguCreatePage />} />
<Route path="/argu/:id" element={<ArguDetailPage />} />
<Route path="/argu/:id/edit" element={<ArguEditPage />} />
```

**Debate 프로젝트:**
```jsx
<Route path="/debate" element={<DebateListPage />} />
<Route path="/debate/create" element={<DebateCreatePage />} />
<Route path="/debate/:id" element={<DebateDetailPage />} />
<Route path="/debate/:id/edit" element={<DebateEditPage />} />
```

---

## 목업(Mockup) 비교

### 파일명 변경

| Argu | Debate |
|------|--------|
| `argu-list.html` | `debate-list.html` |
| `argu-detail.html` | `debate-detail.html` |
| `argu-create.html` | `debate-create.html` |
| `argu-edit.html` | `debate-edit.html` |
| `my-page-argu.html` | `my-page-debate.html` |
| `admin/argu.html` | `admin/debate.html` |

### 클래스명 변경

| Argu | Debate |
|------|--------|
| `argu-list` | `debate-list` |
| `argu-item` | `debate-item` |
| `argu-card` | `debate-card` |
| `argu-title` | `debate-title` |
| `argu-meta` | `debate-meta` |
| `argu-stats` | `debate-stats` |
| `argu-vote` | `debate-vote` |
| `argu-grid` | `debate-grid` |
| `argu-detail` | `debate-detail` |
| `my-argu-item` | `my-debate-item` |

### 텍스트 내용 변경

| Argu | Debate |
|------|--------|
| "논쟁" | "토론" |
| "논쟁 작성" | "토론 작성" |
| "논쟁 목록" | "토론 목록" |
| "논쟁 상세" | "토론 상세" |
| "인기 논쟁" | "인기 토론" |
| "최신 논쟁" | "최신 토론" |
| "논쟁 기간" | "토론 기간" |
| "논쟁 시작" | "토론 시작" |
| "논쟁 종료" | "토론 종료" |

### 이미지 파일

| Argu | Debate |
|------|--------|
| `ARGU.png` | `DEBATE.png` (또는 `ARGU.png` 남아있을 수 있음) |

### JavaScript 설정 변경

| Argu | Debate |
|------|--------|
| `THEME_KEY = 'argu-theme'` | `THEME_KEY = 'debate-theme'` |
| `THEME_KEY = 'argu-admin-theme'` | `THEME_KEY = 'debate-admin-theme'` |

---

## 주요 변경 사항

### 1. 네이밍 컨벤션 변경

#### 백엔드
- **패키지명**: `com.argu` → `com.debate`
- **클래스명**: `Argu*` → `Debate*`
- **서비스명**: `ArguService` → `DebateService`
- **리포지토리명**: `ArguRepository` → `DebateRepository`
- **엔티티명**: `Argu` → `Debate`
- **DTO명**: `*Argu*` → `*Debate*`

#### 프론트엔드
- **컴포넌트명**: `Argu*` → `Debate*`
- **서비스명**: `arguService` → `debateService`
- **경로**: `/argu` → `/debate`
- **폴더명**: `components/argu` → `components/debate`

#### 목업
- **파일명**: `argu-*.html` → `debate-*.html`
- **클래스명**: `argu-*` → `debate-*`
- **텍스트**: "논쟁" → "토론"

### 2. 데이터베이스 스키마 변경

#### 테이블명
- `argu` → `debate`
- 외래키 제약조건명도 함께 변경

#### 컬럼명
- 대부분 동일 (변경 없음)

### 3. API 엔드포인트 변경

| Argu | Debate |
|------|--------|
| `GET /api/argu` | `GET /api/debate` |
| `POST /api/argu` | `POST /api/debate` |
| `GET /api/argu/{id}` | `GET /api/debate/{id}` |
| `PUT /api/argu/{id}` | `PUT /api/debate/{id}` |
| `DELETE /api/argu/{id}` | `DELETE /api/debate/{id}` |
| `GET /api/argu/{id}/opinions` | `GET /api/debate/{id}/opinions` |

---

## 기술 스택 비교

### 공통 기술 스택

#### 백엔드
- **언어**: Java 17
- **프레임워크**: Spring Boot 3.2.0
- **ORM**: JPA (Hibernate)
- **보안**: Spring Security + JWT
- **데이터베이스**: MySQL
- **API 문서화**: SpringDoc OpenAPI (Swagger)

#### 프론트엔드
- **라이브러리**: React 18.2.0
- **라우팅**: React Router 6.20.0
- **HTTP 클라이언트**: Axios 1.6.2
- **에디터**: React Quill 2.0.0
- **빌드 도구**: Vite 5.0.8
- **스타일링**: CSS

### 차이점
**없음** - 두 프로젝트 모두 동일한 기술 스택을 사용합니다.

---

## 파일명 및 네이밍 변경

### 백엔드 Java 파일

| Argu | Debate |
|------|--------|
| `Argu.java` | `Debate.java` |
| `ArguController.java` | `DebateController.java` |
| `ArguService.java` | `DebateService.java` |
| `ArguRepository.java` | `DebateRepository.java` |
| `ArguOpinion.java` | `DebateOpinion.java` |
| `ArguOpinionService.java` | `DebateOpinionService.java` |
| `ArguOpinionRepository.java` | `DebateOpinionRepository.java` |
| `CreateArguRequest.java` | `CreateDebateRequest.java` |
| `UpdateArguRequest.java` | `UpdateDebateRequest.java` |
| `ArguResponse.java` | `DebateResponse.java` |

### 프론트엔드 파일

| Argu | Debate |
|------|--------|
| `ArguListPage.jsx` | `DebateListPage.jsx` |
| `ArguDetailPage.jsx` | `DebateDetailPage.jsx` |
| `ArguCreatePage.jsx` | `DebateCreatePage.jsx` |
| `ArguEditPage.jsx` | `DebateEditPage.jsx` |
| `ArguCard.jsx` | `DebateCard.jsx` |
| `arguService.js` | `debateService.js` |
| `adminArguService.js` | `adminDebateService.js` |

### 목업 HTML 파일

| Argu | Debate |
|------|--------|
| `argu-list.html` | `debate-list.html` |
| `argu-detail.html` | `debate-detail.html` |
| `argu-create.html` | `debate-create.html` |
| `argu-edit.html` | `debate-edit.html` |
| `my-page-argu.html` | `my-page-debate.html` |
| `admin/argu.html` | `admin/debate.html` |

---

## 요약

### 핵심 변경 사항
1. **프로젝트명**: Argu → Debate
2. **용어**: 논쟁 → 토론
3. **네이밍**: 모든 `argu` → `debate`
4. **패키지**: `com.argu` → `com.debate`
5. **테이블명**: `argu` → `debate`
6. **API 경로**: `/api/argu` → `/api/debate`
7. **프론트엔드 경로**: `/argu` → `/debate`

### 기능적 차이
**없음** - 두 프로젝트는 기능적으로 동일하며, 단순히 네이밍과 용어만 변경되었습니다.

### 기술적 차이
**없음** - 두 프로젝트는 동일한 기술 스택과 아키텍처를 사용합니다.

### 마이그레이션 고려사항
1. **데이터베이스 마이그레이션**: 테이블명 변경 시 데이터 마이그레이션 필요
2. **API 호환성**: 기존 API 클라이언트 업데이트 필요
3. **세션/토큰**: JWT 토큰의 클레임 변경 가능성
4. **파일 업로드 경로**: 파일 저장 경로 변경 가능성
5. **환경 변수**: 설정 파일의 프로젝트명 변경 필요

---

**작성일**: 2025년
**비교 대상**: D:\vs\Argu vs D:\vs\Debate
