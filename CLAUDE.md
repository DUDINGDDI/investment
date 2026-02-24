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

### 프론트엔드 (React)
- **Install:** `cd frontend && npm install`
- **Dev server:** `cd frontend && npm run dev` (http://localhost:5173)
- **Build:** `cd frontend && npm run build`
- **Lint:** `cd frontend && npm run lint`
- **Type check:** `cd frontend && npx tsc --noEmit`

### Docker Compose (전체 스택)
- **전체 실행:** `docker compose up -d --build`
- **전체 중지:** `docker compose down`
- **전체 초기화 (데이터 삭제):** `docker compose down -v`
- **로그 확인:** `docker compose logs -f`
- **백엔드 로그:** `docker compose logs -f backend`
- 포트: MySQL 3306, Backend 8080, Frontend(Nginx) 80

### MySQL Docker (DB만 단독)
- **Start:** `cd db && docker compose up -d`
- **Stop:** `cd db && docker compose down`
- **Reset (데이터 삭제):** `cd db && docker compose down -v`

## Architecture

부스 투자 시뮬레이터 — 행사 참가자들이 11개 부스에 가상 코인을 투자/철회하는 모바일 우선 웹앱.

### 백엔드: Spring Boot 4.0.3 (Java 21, Gradle 9.3.0)
- **Base package:** `com.pm.investment`
- **Persistence:** Spring Data JPA + Lombok
- **DB 프로필:** 기본 H2 인메모리 (`ddl-auto: create` + `data.sql` 시드), `mysql` 프로필은 Docker MySQL (`ddl-auto: validate`)
- **인증:** Base64 토큰 기반. `AuthInterceptor`가 `/api/**` 요청을 가로채고, `/api/auth/**`, `/api/admin/**`, `/api/results/**`는 제외. HTTP OPTIONS도 bypass.
- **동시성:** 투자/철회 시 `@Lock(PESSIMISTIC_WRITE)`로 User와 Investment에 비관적 락 적용
- **금액 검증:** 서버에서 10,000 코인 단위 검증, 잔액/투자금 초과 체크
- **예외 처리:** `GlobalExceptionHandler`에서 `IllegalArgumentException`/`IllegalStateException` → 400, `MethodArgumentNotValidException` → 첫 번째 필드 에러 메시지, 기타 → 500. 응답 형식: `{ "error": "message" }`
- **실시간 공지:** `SseEmitterService`로 SSE(Server-Sent Events) 기반 공지 브로드캐스트. `CopyOnWriteArrayList<SseEmitter>`로 구독자 관리, 5분 타임아웃.

### 핵심 도메인 흐름
1. `POST /api/auth/login` → 고유코드+이름으로 유저 자동 생성 또는 로그인 (초기 1,000,000 코인)
2. `POST /api/investments/invest` → 비관적 락으로 User 잔액 차감 + Investment 금액 증가 + History 기록
3. `POST /api/investments/withdraw` → 역방향 동일 로직
4. `POST /api/admin/results/toggle` → `app_settings` 테이블의 `results_revealed` 값 토글
5. `GET /api/results/ranking` → 공개 상태일 때만 부스별 총 투자금액 순위 반환
6. `GET /api/results/announce` → SSE 구독. 공지 등록 시 `announcement` 이벤트, 삭제 시 `cleared` 이벤트 수신
7. `POST /api/admin/announcement` → 공지 저장 + 전체 SSE 브로드캐스트
8. `DELETE /api/admin/announcement` → 공지 삭제 + 전체 SSE 클리어 브로드캐스트

### 프론트엔드: React 19 + TypeScript + Vite
- **스타일링:** CSS Modules (`.module.css`), 토스증권 스타일 디자인 시스템
- **라우팅:** React Router DOM v7. `App.tsx`에서 `PrivateRoute`로 토큰 기반 접근 제어
- **API 통신:** Axios. `api/client.ts`에서 인터셉터로 토큰 자동 첨부 및 401 시 로그아웃
- **상태 관리:** 컴포넌트 로컬 state + `ToastContext`로 글로벌 토스트
- **반응형:** max-width 480px 컨테이너 고정, 모바일 앱 프레임 유지
- **공지 배너:** `AnnouncementBanner`가 `AppLayout`에 포함되어 모든 인증 페이지 상단에 SSE로 실시간 공지 표시. 클릭 시 팝업으로 전체 내용 확인, 닫기(dismiss)는 `localStorage`에 `updatedAt` 기준으로 저장.

### 프론트엔드 라우트
| 경로 | 페이지 | 비고 |
|------|--------|------|
| `/` | LoginPage | 인증 불필요 |
| `/home` | HomePage | 대시보드 + 도넛 차트 |
| `/booths` | BoothListPage | 부스 목록 |
| `/booths/:id` | BoothDetailPage | 투자/철회 바텀시트 |
| `/history` | HistoryPage | 날짜별 그룹핑 |
| `/result` | ResultPage | Coming Soon 또는 랭킹 |
| `/admin` | AdminPage | 관리자 전용, BottomNav 없음 |

## Key Configuration

- `src/main/resources/application.yaml` — DB 프로필(H2/MySQL), 서버 포트(8080)
- `src/main/resources/data.sql` — H2 시드 데이터 (11개 부스 + app_settings)
- `db/docker-compose.yml` — MySQL 8.0 Docker (booth_invest DB, booth_user/booth1234)
- `db/init/` — MySQL 초기화 SQL (스키마 + 시드 + 테스트 유저)
- `build.gradle` — 의존성 (JPA, WebMVC, Validation, H2, MySQL, Lombok)
- `frontend/src/api/client.ts` — Axios 인스턴스. baseURL은 `VITE_API_URL` 환경변수 또는 기본값 `/api`
- `.env` — Docker Compose 환경변수 (`.gitignore`에 포함, `.env.example` 참고)
- `docker-compose.yml` — 전체 스택 Docker Compose (MySQL + Backend + Frontend/Nginx)
- `Dockerfile.backend` — Spring Boot 백엔드 멀티스테이지 빌드
- `frontend/Dockerfile` — React 프론트엔드 빌드 + Nginx 서빙
- `frontend/nginx.conf` — Nginx 리버스 프록시 설정 (API → backend, SPA 라우팅)
- `deploy.sh` — AWS EC2 배포 스크립트
