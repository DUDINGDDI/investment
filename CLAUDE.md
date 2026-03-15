# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
모든 언어는 한국어를 사용해야해

## Build & Development Commands

### 백엔드 (Spring Boot)
- **Build:** `./gradlew build`
- **Run (H2):** `./gradlew bootRun`
- **Run (MySQL):** `./gradlew bootRun --args='--spring.profiles.active=mysql'`
- **Test (all):** `./gradlew test`
- **Test (single class):** `./gradlew test --tests "com.pm.investment.SomeTest"`
- **Test (single method):** `./gradlew test --tests "com.pm.investment.SomeTest.methodName"`
- **Clean:** `./gradlew clean`
- **빌드 산출물:** `build/libs/investment-0.0.1-SNAPSHOT.jar`

### 아이디어 보드 (별도 마이크로서비스)
- **Build:** `cd idea-board && ./gradlew build`
- **Run:** `cd idea-board && ./gradlew bootRun` (포트 8081)
- **빌드 산출물:** `idea-board/build/libs/idea-board-0.0.1-SNAPSHOT.jar`
- CI에서는 테스트 없이 빌드: `./gradlew build -x test`

### 프론트엔드 (React)
- **Install:** `cd frontend && npm install`
- **Dev server:** `cd frontend && npm run dev` (http://localhost:5173)
- **Build:** `cd frontend && npm run build` → `frontend/dist/`
- **Lint:** `cd frontend && npm run lint`
- **Type check:** `cd frontend && npx tsc --noEmit`

### Docker Compose
- **개발 전체 실행:** `docker compose up -d --build`
- **운영 전체 실행:** `docker compose -f docker-compose.prod.yml up -d --build`
- **전체 중지:** `docker compose down`
- **전체 초기화 (데이터 삭제):** `docker compose down -v`
- **MySQL만 (로컬 개발):** `cd db && docker compose up -d`

## Architecture

멀티 시스템 이벤트 플랫폼 — 행사 참가자들이 부스에 가상 코인 투자(PM), 주식 매매(AM), 미션 수행, 쪽지, 부스 평가 등을 하는 모바일 우선 웹앱.

### 서비스 구성 (3개 서비스)
| 서비스 | 기술 스택 | 포트 | 패키지 |
|--------|-----------|------|--------|
| 메인 백엔드 | Spring Boot 4.0.3, Java 21, Gradle 9.3.0 | 8080 | `com.pm.investment` |
| 아이디어 보드 | Spring Boot, Java 21 (별도 Gradle 프로젝트) | 8081 | `com.pm.ideaboard` |
| 프론트엔드 | React 19 + TypeScript + Vite | 5173 (dev), 80/443 (prod) | — |

### 백엔드 (`com.pm.investment`)
- **패키지 구조:** `config/`, `controller/`, `service/`, `repository/`, `entity/`, `dto/`
- **Persistence:** Spring Data JPA + Lombok
- **DB 프로필:** 기본 H2 인메모리 (`ddl-auto: create` + `data.sql` 시드), `mysql` 프로필은 Docker MySQL (`ddl-auto: validate`)
- **인증:** Base64 토큰 기반 (`Base64(userId:timestamp)`). `AuthInterceptor`가 `/api/**` 요청을 가로채고, `/api/auth/**`, `/api/admin/**`, `/api/results/**`는 제외
- **동시성:** 투자/철회 시 `@Lock(PESSIMISTIC_WRITE)` 비관적 락
- **금액 검증:** 서버에서 10,000 코인 단위 검증, 잔액/투자금 초과 체크
- **예외 처리:** `GlobalExceptionHandler` — `IllegalArgumentException`/`IllegalStateException` → 400, 기타 → 500. 응답: `{ "error": "message" }`
- **실시간 공지:** `SseEmitterService`로 SSE 브로드캐스트, 5분 타임아웃

### 아이디어 보드 (`com.pm.ideaboard`)
- `idea-board/` 디렉토리에 독립된 Spring Boot 프로젝트
- 메인 백엔드와 같은 MySQL DB 공유, H2 미지원
- 프론트엔드에서 `/api/idea-board/` 경로로 접근 (Vite/Nginx 프록시)

### 이중 투자 시스템
- **PM 투자 (코인):** User.balance + Investment + InvestmentHistory. 초기 잔액 100,000,000
- **AM 주식 거래:** StockAccount + StockHolding + StockTradeHistory. 별도 계좌, 주식 가격 동적 변경

### 엔티티 관계
```
── PM 투자 ──
Zone (1) ──< (N) Booth
User (1) ──< (N) Investment >──(1) Booth   [UNIQUE(user_id, booth_id)]
User (1) ──< (N) InvestmentHistory >──(1) Booth
User (1) ──< (N) BoothRating >──(1) Booth
User (1) ──< (N) BoothVisit >──(1) Booth   [UNIQUE]

── AM 주식 ──
User (1) ──(1) StockAccount
StockBooth (1) ──(1) StockPrice
User (1) ──< (N) StockHolding >──(1) StockBooth   [UNIQUE]
User (1) ──< (N) StockTradeHistory >──(1) StockBooth
StockBooth (1) ──< (N) StockPriceHistory
User (1) ──< (N) StockComment >──(1) StockBooth
User (1) ──< (N) StockRating >──(1) StockBooth   [UNIQUE]
User (1) ──< (N) StockBoothVisit >──(1) StockBooth   [UNIQUE]

── 공통 ──
User (1) ──< (N) UserMission   [UNIQUE(user_id, mission_id)]
User (1) ──< (N) Note (sender/receiver)
AppSetting — key-value 독립 테이블
```

### REST API 구조
- **인증/사용자:** `/api/auth/**`, `/api/users/**`
- **PM 부스/투자:** `/api/booths/**`, `/api/investments/**`, `/api/zones/**`
- **AM 주식:** `/api/stocks/**`
- **미션/방문/쪽지:** `/api/missions/**`, `/api/visits/**`, `/api/notes/**`
- **아이디어 보드:** `/api/idea-board/**` (별도 서비스로 프록시)
- **결과/상태:** `/api/results/**` (인증 불필요)
- **관리자:** `/api/admin/**` (인증 불필요) — 토글, 가격 변경, 티켓, 공지, 랭킹
- 상세 엔드포인트는 각 Controller 파일 참조

### 프론트엔드 (React 19 + TypeScript + Vite)
- **스타일링:** CSS Modules (`.module.css`), 다크 테마 (`#17171C`), CJ 퍼플 `#6C5CE7`
- **브랜딩:** CJ ONLYONE 커스텀 폰트, CJ 로고
- **라우팅:** React Router DOM v7. `PrivateRoute`로 토큰 기반 접근 제어
- **API 통신:** Axios. `api/client.ts`에서 인터셉터로 Bearer 토큰 자동 첨부 및 401 시 로그아웃
- **상태 관리:** 컴포넌트 로컬 state + `ToastContext` (글로벌 토스트) + `MissionContext` (미션/배지)
- **반응형:** max-width 480px 컨테이너 고정, 모바일 앱 프레임
- **레이아웃 (`AppLayout`):** `AppHeader` → `AnnouncementBanner`(SSE 실시간 공지) → `TopTabBar`/`StockTopTabBar` → 페이지 콘텐츠 → `FloatingMenu`(FAB)
- **네비게이션:** `PageBackButton` 컴포넌트로 서브 페이지에 명시적 상위 페이지 이동 (글로벌 뒤로가기 없음)
- **API 모듈:** `frontend/src/api/index.ts` — `authApi`, `userApi`, `boothApi`, `investmentApi`, `resultApi`, `zoneApi`, `stockApi`, `missionApi`, `visitApi`, `noteApi`, `ideaBoardApi`, `adminApi`
- **타입 정의:** `frontend/src/types/index.ts`에 모든 DTO 타입 중앙 관리

## Code Conventions

### 백엔드
- **Lombok 패턴:** 엔티티 `@Getter @Setter @Builder @AllArgsConstructor @NoArgsConstructor(access = PROTECTED)`, DTO `@Getter @Builder`
- **네이밍:** `*Repository`, `*Service`, `*Controller`, DTO `*Request`/`*Response`
- **DB 컬럼:** snake_case, Java 필드: camelCase
- **타임스탬프:** `@PrePersist`로 `createdAt`, `@PreUpdate`로 `updatedAt`

### 프론트엔드
- **CSS 클래스명:** CSS Modules 내 camelCase (`container`, `header`, `itemActive`)
- **localStorage 키:** `token`, `userName`, `userCompany`, `announcement_dismissed_at`, `booth_memo_{id}` (PM 메모), `stock_memo_{id}` (AM 메모)
- **뒤로가기:** 서브 페이지는 `PageBackButton` 컴포넌트 사용 (명시적 `to` 경로). 최상위 페이지에는 뒤로가기 없음

## Development Environment

### 로컬 개발 포트
| 서비스 | URL |
|--------|-----|
| 프론트엔드 (Vite) | http://localhost:5173 |
| 백엔드 | http://localhost:8080 |
| 아이디어 보드 | http://localhost:8081 |
| H2 콘솔 | http://localhost:8080/h2-console |
| MySQL (Docker) | localhost:3306 |

### Vite 프록시 설정
- `/api/idea-board/` → `http://localhost:8081` (아이디어 보드 서비스)
- `/api/` → `http://localhost:8080` (메인 백엔드)

### 환경 변수
- `frontend/.env.development` — `VITE_API_URL=http://localhost:8080/api`
- `IDEA_BOARD_URL` — 백엔드 환경변수 (기본값: `http://localhost:8081`)

## Key Configuration

- `src/main/resources/application.yaml` — DB 프로필(H2/MySQL), 서버 포트(8080), H2 콘솔
- `src/main/resources/data.sql` — H2 시드 데이터 (존 + 부스 + 주식부스 + app_settings)
- `idea-board/src/main/resources/application.yaml` — 아이디어 보드 설정 (MySQL only, 포트 8081)
- `db/docker-compose.yml` — MySQL 8.0 Docker (booth_invest DB)
- `db/init/` — MySQL 초기화 SQL (`01_schema.sql`, `02_seed_data.sql`)
- `frontend/src/api/client.ts` — Axios 인스턴스, baseURL `VITE_API_URL` 또는 `/api`
- `docker-compose.yml` — 개발 스택 (MySQL + Backend + Idea Board + Frontend + Nginx)
- `docker-compose.prod.yml` — 운영 스택 (SSL/TLS, Certbot, 높은 리소스 제한)
- `frontend/nginx.conf` — 운영 Nginx (HTTPS, SPA, 정적 캐싱, SSE 프록시)
- `nginx.dev.conf` — 개발 Nginx (프록시만, SSL 없음)
- `deploy.sh` — AWS EC2 배포 스크립트 (systemd 서비스 등록, Nginx, UFW)

## CI/CD

`.github/workflows/deploy.yml`:
1. **test-backend** — `./gradlew test` (JUnit)
2. **test-idea-board** — `./gradlew build -x test` (빌드 검증만)
3. **test-frontend** — `npm run lint` + `npx tsc --noEmit`
4. **deploy** — 모든 테스트 통과 후 SSH로 EC2 배포, 헬스체크 (`/api/results/status`)

## Deployment (Dev vs Prod)

| 항목 | 개발 | 운영 |
|------|------|------|
| 프론트엔드 | Vite dev server (5173) | Nginx 정적 + SPA 라우팅 |
| 백엔드 JVM | -Xms1g -Xmx2g | -Xms2g -Xmx4g |
| 아이디어 보드 JVM | -Xms128m -Xmx256m | -Xms512m -Xmx1g |
| SSL | 없음 | Let's Encrypt (Certbot) |
| 프론트엔드 빌드 | 볼륨 마운트 (핫 리로드) | Docker 이미지에 빌드 포함 |
