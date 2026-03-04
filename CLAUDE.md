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
- 포트: MySQL 3306, Backend 8080, Frontend(Nginx) 80

### MySQL Docker (DB만 단독)
- **Start:** `cd db && docker compose up -d`
- **Stop:** `cd db && docker compose down`
- **Reset (데이터 삭제):** `cd db && docker compose down -v`

## Architecture

멀티 시스템 이벤트 플랫폼 — 행사 참가자들이 부스에 가상 코인 투자(PM), 주식 매매(AM), 미션 수행, 쪽지, 부스 평가 등을 하는 모바일 우선 웹앱.

### 백엔드: Spring Boot 4.0.3 (Java 21, Gradle 9.3.0)
- **Base package:** `com.pm.investment`
- **패키지 구조:** `config/`, `controller/` (13개), `service/` (16개), `repository/` (19개), `entity/` (23개), `dto/` (50개+)
- **Persistence:** Spring Data JPA + Lombok
- **DB 프로필:** 기본 H2 인메모리 (`ddl-auto: create` + `data.sql` 시드), `mysql` 프로필은 Docker MySQL (`ddl-auto: validate`)
- **인증:** Base64 토큰 기반 (`Base64(userId:timestamp)`). `AuthInterceptor`가 `/api/**` 요청을 가로채고, `/api/auth/**`, `/api/admin/**`, `/api/results/**`는 제외
- **동시성:** 투자/철회 시 `@Lock(PESSIMISTIC_WRITE)` 비관적 락
- **금액 검증:** 서버에서 10,000 코인 단위 검증, 잔액/투자금 초과 체크
- **예외 처리:** `GlobalExceptionHandler` — `IllegalArgumentException`/`IllegalStateException` → 400, 기타 → 500. 응답: `{ "error": "message" }`
- **실시간 공지:** `SseEmitterService`로 SSE 브로드캐스트, 5분 타임아웃

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

### REST API 엔드포인트

**인증/사용자:**
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/auth/login` | 로그인/회원가입 |
| GET | `/api/users/me` | 내 정보 조회 |
| GET | `/api/users/me/booth-visitors` | 내 부스 방문자 수 |

**PM 부스/투자:**
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/booths` | 전체 부스 목록 |
| GET | `/api/booths/:id` | 부스 상세 |
| POST | `/api/booths/:id/rating` | 부스 평가 제출 |
| GET | `/api/booths/:id/rating` | 내 부스 평가 조회 |
| GET | `/api/booths/:id/reviews` | 부스 리뷰 |
| DELETE | `/api/booths/:id/rating/review` | 리뷰 삭제 |
| POST | `/api/investments/invest` | 투자 |
| POST | `/api/investments/withdraw` | 철회 |
| GET | `/api/investments/my` | 내 투자 목록 |
| GET | `/api/investments/history` | 투자 내역 |
| GET | `/api/zones` | 전체 존 목록 |
| GET | `/api/zones/:code` | 존별 부스 목록 |

**AM 주식:**
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/stocks/buy` | 주식 매수 |
| POST | `/api/stocks/sell` | 주식 매도 |
| GET | `/api/stocks/my` | 내 보유 주식 |
| GET | `/api/stocks/history` | 거래 내역 |
| GET | `/api/stocks/account` | 내 주식 계좌 |
| GET | `/api/stocks/cospi` | COSPI 지수 |
| GET | `/api/stocks/booths` | 주식 부스 목록 |
| GET | `/api/stocks/booths/:id` | 주식 부스 상세 |
| GET | `/api/stocks/booths/:id/price-history` | 가격 내역 |
| GET | `/api/stocks/booths/:id/my-history` | 특정 부스 내 거래 |
| GET/POST | `/api/stocks/booths/:id/comments` | 댓글 조회/추가 |
| POST | `/api/stocks/booths/:id/rating` | 주식 평가 제출 |
| GET | `/api/stocks/booths/:id/rating` | 내 주식 평가 조회 |
| GET | `/api/stocks/booths/:id/reviews` | 리뷰 조회 |
| DELETE | `/api/stocks/booths/:id/rating/review` | 리뷰 삭제 |

**미션/방문/쪽지/아이디어:**
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/missions/my` | 내 미션 목록 |
| POST | `/api/missions/progress` | 미션 진행도 |
| POST | `/api/missions/complete` | 미션 완료 |
| POST | `/api/missions/together` | 함께 완료 (부스UUID) |
| GET | `/api/missions/ranking` | 미션 랭킹 |
| POST | `/api/visits` | 부스 방문 기록 |
| GET | `/api/visits/my` | 내 방문 기록 |
| POST | `/api/notes` | 쪽지 발송 |
| GET | `/api/notes/received` | 수신 쪽지 |
| GET | `/api/notes/sent` | 발신 쪽지 |
| PATCH | `/api/notes/:id/read` | 읽음 처리 |
| GET | `/api/notes/unread-count` | 미읽음 수 |
| GET | `/api/notes/users/search` | 사용자 검색 |
| GET | `/api/idea-board/booths/:id` | 아이디어 보드 |

**결과/상태:**
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/results/status` | 결과 공개 여부 |
| GET | `/api/results/investment-status` | 투자 활성화 여부 |
| GET | `/api/results/stock-status` | 주식 활성화 여부 |
| GET | `/api/results/mission-result-status` | 미션 결과 공개 |
| GET | `/api/results/stock-ranking-status` | 주식 랭킹 표시 |
| GET | `/api/results/dream-status` | 드림 활성화 |
| GET | `/api/results/ranking` | 부스별 랭킹 |
| GET | `/api/results/announcement` | 현재 공지 |
| GET | `/api/results/announce` | SSE 구독 |

**관리자:**
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET/POST | `/api/admin/results/status`, `/toggle` | 결과 공개 토글 |
| GET/POST | `/api/admin/investment/status`, `/toggle` | 투자 활성화 토글 |
| GET/POST | `/api/admin/stock/status`, `/toggle` | 주식 활성화 토글 |
| GET/POST | `/api/admin/stock-ranking/status`, `/toggle` | 주식 랭킹 토글 |
| GET/POST | `/api/admin/mission-result/status`, `/toggle` | 미션 결과 토글 |
| GET/POST | `/api/admin/dream/status`, `/toggle` | 드림 토글 |
| POST | `/api/admin/stocks/price` | 주식 가격 변경 |
| POST | `/api/admin/tickets/use` | 티켓 사용 처리 |
| GET/POST/DELETE | `/api/admin/announcement` | 공지 관리 + SSE |
| GET | `/api/admin/ranking` | 투자 랭킹 |
| GET | `/api/admin/ratings` | AM 부스 평가 결과 |
| GET | `/api/admin/booth-ratings` | PM 부스 평가 결과 |

### 프론트엔드: React 19 + TypeScript + Vite
- **스타일링:** CSS Modules (`.module.css`), 다크 테마 (`#17171C`), CJ 퍼플 `#6C5CE7`
- **브랜딩:** CJ ONLYONE 커스텀 폰트, CJ 로고
- **라우팅:** React Router DOM v7. `PrivateRoute`로 토큰 기반 접근 제어
- **API 통신:** Axios. `api/client.ts`에서 인터셉터로 Bearer 토큰 자동 첨부 및 401 시 로그아웃
- **상태 관리:** 컴포넌트 로컬 state + `ToastContext` (글로벌 토스트) + `MissionContext` (미션/배지)
- **반응형:** max-width 480px 컨테이너 고정, 모바일 앱 프레임
- **레이아웃 (`AppLayout`):** `AppHeader` → `AnnouncementBanner`(SSE 실시간 공지) → `TopTabBar`/`StockTopTabBar` → 페이지 콘텐츠 → `FloatingMenu`(FAB)
- **네비게이션:** `PageBackButton` 컴포넌트로 서브 페이지에 명시적 상위 페이지 이동 (글로벌 뒤로가기 없음)

### 프론트엔드 API 모듈 (`frontend/src/api/index.ts`)
- `authApi`: login
- `userApi`: getMe, getMyBoothVisitors
- `boothApi`: getAll, getById, submitRating, getMyRating, getBoothReviews, deleteReview
- `investmentApi`: invest, withdraw, getMy, getHistory
- `resultApi`: getStatus, getInvestmentStatus, getStockStatus, getMissionResultStatus, getDreamStatus, getStockRankingStatus, getRanking, getAnnouncement
- `zoneApi`: getAll, getByCode
- `stockApi`: buy, sell, getMy, getHistory, getAccount, getBooths, getBoothById, getPriceHistory, getBoothHistory, getComments, addComment, submitRating, getMyRating, getBoothReviews, deleteReview, getCospi
- `missionApi`: getMyMissions, updateProgress, completeMission, completeTogether, getRanking
- `visitApi`: visit, getMyVisits
- `noteApi`: send, getReceived, getSent, markAsRead, getUnreadCount, searchUsers
- `ideaBoardApi`: getBoard
- `adminApi`: 모든 토글/상태 + ranking + ratings + boothRatings + announcement + useTicket

### 프론트엔드 라우트
| 경로 | 페이지 | 비고 |
|------|--------|------|
| `/` | LoginPage | 인증 불필요 |
| `/home` | HomePage | PM 대시보드 + 도넛 차트 |
| `/booths` | BoothListPage | PM 부스 목록 |
| `/booths/:id` | BoothDetailPage | PM 부스 상세 + 투자/철회 모달 |
| `/history` | HistoryPage | PM 투자 내역 |
| `/result` | ResultPage | 랭킹 또는 Coming Soon |
| `/stocks` | StockHomePage | AM 홈 + 포트폴리오 + COSPI 차트 |
| `/stocks/booths` | StockBoothListPage | AM 주식 부스 목록 |
| `/stocks/booths/:id` | StockBoothDetailPage | AM 상세 + 매수/매도 + 가격차트 + 댓글 |
| `/stocks/history` | StockHistoryPage | AM 거래 내역 |
| `/map` | MapPage | 행사장 지도 (캐러셀 + 핫스팟) |
| `/map/:zoneId` | ZoneBoothListPage | 구역별 부스 목록 |
| `/mypage` | MyPage | 마이페이지 (메모/이벤트존/쪽지) |
| `/qr` | QrPage | QR 코드 |
| `/idea-board/:boothId` | IdeaBoardPage | 아이디어 보드 |
| `/admin` | AdminPage | 관리자 (상시기능/투자순위/기능관리 탭) |
| `/admin/ticket-scan` | AdminTicketScanPage | 티켓 스캔 |

## Code Conventions

### 백엔드
- **Lombok 패턴:** 엔티티 `@Getter @Setter @Builder @AllArgsConstructor @NoArgsConstructor(access = PROTECTED)`, DTO `@Getter @Builder`
- **네이밍:** `*Repository`, `*Service`, `*Controller`, DTO `*Request`/`*Response`
- **DB 컬럼:** snake_case, Java 필드: camelCase
- **타임스탬프:** `@PrePersist`로 `createdAt`, `@PreUpdate`로 `updatedAt`

### 프론트엔드
- **TypeScript 인터페이스:** `frontend/src/types/index.ts`에 모든 DTO 타입 중앙 관리
- **CSS 클래스명:** CSS Modules 내 camelCase (`container`, `header`, `itemActive`)
- **localStorage 키:** `token`, `userName`, `userCompany`, `announcement_dismissed_at`, `booth_memo_{id}` (PM 메모), `stock_memo_{id}` (AM 메모)
- **뒤로가기:** 서브 페이지는 `PageBackButton` 컴포넌트 사용 (명시적 `to` 경로). 최상위 페이지에는 뒤로가기 없음

## Key Configuration

- `src/main/resources/application.yaml` — DB 프로필(H2/MySQL), 서버 포트(8080), H2 콘솔(`/h2-console`)
- `src/main/resources/data.sql` — H2 시드 데이터 (존 + 부스 + 주식부스 + app_settings)
- `db/docker-compose.yml` — MySQL 8.0 Docker (booth_invest DB)
- `db/init/` — MySQL 초기화 SQL (`01_schema.sql`, `02_seed_data.sql`)
- `frontend/src/api/client.ts` — Axios 인스턴스. baseURL `VITE_API_URL` 또는 `/api`
- `frontend/.env.development` — `VITE_API_URL=http://localhost:8080/api`
- `docker-compose.yml` — 전체 스택 (MySQL + Backend + Frontend/Nginx)
- `frontend/nginx.conf` — 리버스 프록시 (`/api/` → backend:8080, SSE용 `proxy_buffering off`)
- `deploy.sh` — AWS EC2 배포 스크립트
