# 부스 투자 시뮬레이터 웹앱 프로젝트 프롬프트

## 프로젝트 개요

11개의 부스가 순서대로 발표를 진행하는 행사에서, 참가자들이 자신의 코인(가상 화폐)을 원하는 부스에 투자하고 철회할 수 있는 **모바일 우선 투자 시뮬레이터 웹앱**을 만들어줘.

---

## 기술 스택

- **Frontend**: React (Vite 기반, TypeScript)
- **Backend**: Java Spring Boot 3.x
- **Database**: MySQL (또는 H2 개발용)
- **API 통신**: REST API (JSON)
- **스타일링**: 모바일 퍼스트 반응형 디자인 (CSS Modules 또는 styled-components)

---

## 사용 환경

- **주 사용 환경**: 모바일 (발표장에서 스마트폰으로 접속)
- 모바일 퍼스트로 설계하되, PC에서도 깨지지 않게 반응형 처리
- 터치 친화적 UI (버튼 크기, 간격 충분히)

---

## 사용자 인증

- 별도 회원가입 없음
- **고유 코드(학번/사번) + 이름 입력** 방식으로 로그인
- 최초 로그인 시 자동으로 유저 생성 + 초기 코인 지급
- 이미 존재하는 코드로 로그인하면 기존 데이터 불러오기
- 세션 또는 JWT 토큰으로 로그인 상태 유지

---

## 핵심 기능

### 1. 로그인 페이지
- 고유 코드(학번/사번) 입력 필드
- 이름 입력 필드
- 입장하기 버튼
- 초기 지급 코인: **1,000,000 코인**

### 2. 메인 홈 (대시보드)
- 내 보유 코인 잔액 표시
- 총 투자 금액 표시
- 투자 중인 부스 요약 (상위 3개 정도)
- 부스 목록으로 이동하는 바로가기

### 3. 부스 목록 페이지
- 11개 부스를 카드 형태로 나열
- 각 카드에 표시할 정보: 부스 이름, 카테고리, 한줄 소개, 현재 총 투자금액(모든 유저 합산)
- 카드 클릭 시 부스 상세 페이지로 이동

### 4. 부스 상세 페이지
- 부스 이름, 카테고리, 상세 설명
- 해당 부스의 총 투자금액 (전체 유저 합산)
- 내가 이 부스에 투자한 금액
- **투자하기 기능**: 정해진 단위(10,000 코인 단위)로 투자 금액 선택 후 투자
  - 버튼 예시: [+1만] [+5만] [+10만] [+50만] 또는 수량 조절 UI
  - 보유 코인 초과 시 투자 불가 처리
- **철회하기 기능**: 투자한 금액 범위 내에서 동일한 단위로 철회
  - 투자 금액이 0이면 철회 버튼 비활성화

### 5. 내 포트폴리오 페이지
- 내가 투자한 부스 목록 + 각 투자 금액
- 전체 투자 비율을 시각적으로 표시 (원형 차트 또는 막대 차트)
- 보유 코인 잔액
- 총 투자 금액

### 6. 투자 이력 페이지
- 내 투자/철회 기록을 시간순으로 표시 (최신순)
- 각 이력에 표시할 정보: 부스 이름, 투자/철회 구분, 금액, 일시
- 투자는 초록색, 철회는 빨간색으로 구분

---

## 하단 네비게이션 (Bottom Navigation)

모바일 앱 느낌의 하단 고정 네비게이션 바:
- 홈 | 부스 | 포트폴리오 | 이력

---

## DB 설계

### users 테이블
```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    unique_code VARCHAR(20) NOT NULL UNIQUE,  -- 학번/사번
    name VARCHAR(50) NOT NULL,
    balance BIGINT NOT NULL DEFAULT 1000000,  -- 보유 코인
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### booths 테이블
```sql
CREATE TABLE booths (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    display_order INT NOT NULL,           -- 발표 순서
    logo_emoji VARCHAR(10),               -- 아이콘/이모지
    theme_color VARCHAR(7),               -- 테마 색상 (#HEX)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### investments 테이블 (현재 투자 현황)
```sql
CREATE TABLE investments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    booth_id BIGINT NOT NULL,
    amount BIGINT NOT NULL DEFAULT 0,     -- 현재 투자 금액
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (booth_id) REFERENCES booths(id),
    UNIQUE KEY uk_user_booth (user_id, booth_id)
);
```

### investment_history 테이블 (투자 이력)
```sql
CREATE TABLE investment_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    booth_id BIGINT NOT NULL,
    type ENUM('INVEST', 'WITHDRAW') NOT NULL,
    amount BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (booth_id) REFERENCES booths(id)
);
```

---

## REST API 설계

### 인증
- `POST /api/auth/login` — 고유코드 + 이름으로 로그인 (없으면 자동 생성)
  - Request: `{ "uniqueCode": "2024001", "name": "홍길동" }`
  - Response: `{ "userId": 1, "name": "홍길동", "balance": 1000000, "token": "..." }`

### 유저
- `GET /api/users/me` — 내 정보 조회 (잔액 포함)

### 부스
- `GET /api/booths` — 전체 부스 목록 (각 부스별 총 투자금액 포함)
- `GET /api/booths/{id}` — 부스 상세 (내 투자금액 + 전체 투자금액 포함)

### 투자
- `POST /api/investments/invest` — 투자하기
  - Request: `{ "boothId": 1, "amount": 50000 }`
  - 검증: amount는 10,000 단위, 잔액 충분한지 확인
- `POST /api/investments/withdraw` — 철회하기
  - Request: `{ "boothId": 1, "amount": 30000 }`
  - 검증: amount는 10,000 단위, 투자 금액 범위 내인지 확인
- `GET /api/investments/my` — 내 포트폴리오 (투자 중인 부스 + 금액 목록)
- `GET /api/investments/history` — 내 투자 이력 (시간순 정렬)

---

## 초기 부스 데이터 (seed)

11개 부스를 DB에 미리 넣어줘. 이름과 카테고리, 설명은 자유롭게 지어줘도 되지만, 아래 형식으로:

| 순서 | 부스명 | 카테고리 | 설명 |
|------|--------|----------|------|
| 1~11 | 자유 | 자유 | 각 부스별 2~3문장의 소개 |

---

## 프로젝트 구조

```
project-root/
├── frontend/                  # React (Vite + TypeScript)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── HomePage.tsx
│   │   │   ├── BoothListPage.tsx
│   │   │   ├── BoothDetailPage.tsx
│   │   │   ├── PortfolioPage.tsx
│   │   │   └── HistoryPage.tsx
│   │   ├── components/
│   │   │   ├── BottomNav.tsx
│   │   │   ├── BoothCard.tsx
│   │   │   ├── InvestModal.tsx
│   │   │   └── PortfolioChart.tsx
│   │   ├── api/               # API 호출 함수들
│   │   ├── types/             # TypeScript 타입 정의
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
└── backend/                   # Spring Boot
    └── src/main/java/com/boothInvest/
        ├── controller/
        │   ├── AuthController.java
        │   ├── BoothController.java
        │   └── InvestmentController.java
        ├── service/
        │   ├── UserService.java
        │   ├── BoothService.java
        │   └── InvestmentService.java
        ├── repository/
        │   ├── UserRepository.java
        │   ├── BoothRepository.java
        │   ├── InvestmentRepository.java
        │   └── InvestmentHistoryRepository.java
        ├── entity/
        │   ├── User.java
        │   ├── Booth.java
        │   ├── Investment.java
        │   └── InvestmentHistory.java
        ├── dto/
        │   ├── LoginRequest.java
        │   ├── InvestRequest.java
        │   └── WithdrawRequest.java
        └── config/
            ├── SecurityConfig.java
            └── CorsConfig.java
```

---

## 구현 시 주의사항

1. **동시성 처리**: 투자/철회 시 잔액과 투자금액의 정합성을 위해 트랜잭션 처리 필수. 낙관적 락 또는 비관적 락 사용 고려.
2. **금액 단위 검증**: 서버 사이드에서 반드시 10,000 코인 단위인지 검증
3. **잔액 검증**: 투자 시 잔액 부족 체크, 철회 시 투자금액 초과 체크 모두 서버에서 수행
4. **모바일 UX**: 터치 타겟 최소 44px, 스크롤 자연스럽게, 하단 네비게이션 고정
5. **API 에러 핸들링**: 프론트에서 에러 발생 시 토스트 메시지로 사용자에게 안내
6. **CORS 설정**: 개발 환경에서 프론트(Vite dev server)와 백엔드 간 CORS 허용

---

## 디자인 가이드 — 토스증권 스타일 참고

이 앱의 디자인은 **토스증권 앱의 UX/UI를 적극 참고**하여 세련되고 깔끔하게 만들어야 한다.

### 핵심 디자인 원칙

1. **한 화면에 한 가지 핵심 정보**: 화면을 복잡하게 채우지 않는다. 각 화면마다 가장 중요한 정보가 즉시 눈에 들어와야 한다.
2. **불필요한 그래픽 요소 제거**: 장식적인 요소를 최소화하고 정보 전달에 집중한다.
3. **친근하고 쉬운 용어**: 딱딱한 금융 용어 대신 쉬운 말을 쓴다 (예: "매수" → "투자하기", "매도" → "철회하기").
4. **엄지 중심 네비게이션**: 모바일에서 엄지로 쉽게 조작 가능하도록 하단에 주요 액션 버튼 배치.

### 색상 체계

```
배경색 (라이트 테마 기본):
- 주 배경: #FFFFFF
- 보조 배경 (카드, 섹션): #F5F6F8
- 구분선: #EEEFF1

텍스트:
- 주 텍스트: #191F28
- 보조 텍스트: #8B95A1
- 비활성 텍스트: #B0B8C1

포인트 컬러:
- 메인 액센트 (CTA 버튼): #3182F6 (토스 블루)
- 상승/투자: #F04452 (빨간색)
- 하락/철회: #3182F6 (파란색)
- 성공/완료: #00C851 (초록색)

각 부스별 고유 테마 컬러를 지정하여 시각적 구분 (로고 아이콘 배경에 사용)
```

### 타이포그래피

```
- 폰트: Pretendard (웹폰트) — 토스에서 사용하는 것과 유사한 깔끔한 고딕체
- 금액 숫자: font-weight 700 (Bold), 큰 사이즈로 강조
- 코인 잔액 표시: 28~32px, Bold
- 부스명: 18~20px, SemiBold
- 본문/설명: 14~15px, Regular
- 보조 텍스트: 12~13px, Regular, #8B95A1
```

### 레이아웃 & 컴포넌트

```
카드 스타일:
- border-radius: 16px
- background: #FFFFFF
- box-shadow: 없음 (플랫) 또는 매우 미세한 그림자
- padding: 20px
- 카드 간 간격: 12px

버튼 스타일:
- 주요 CTA: background #3182F6, 텍스트 white, border-radius 12px, height 52px
- 보조 버튼: background #F2F4F6, 텍스트 #333, border-radius 12px
- 금액 단위 선택 버튼: 알약(pill) 형태, border-radius 20px

하단 네비게이션:
- 배경: #FFFFFF
- 높이: 60px + safe-area-inset-bottom
- border-top: 1px solid #EEEFF1
- 아이콘 + 라벨 구조
- 활성 탭: #3182F6, 비활성: #8B95A1
```

### 화면별 디자인 상세

**로그인 페이지:**
- 중앙 정렬, 미니멀
- 상단에 앱 로고 + 앱 이름
- 입력 필드는 밑줄 스타일 또는 라운드 박스
- "입장하기" 버튼은 하단 고정, 풀 와이드

**메인 홈 (대시보드):**
- 상단: 인사말 ("OOO님의 투자") + 보유 코인 잔액 (크고 굵게)
- 중간: 투자 요약 카드 — 총 투자금액, 투자 중인 부스 수
- 하단: 내 투자 부스 리스트 (투자 금액순 정렬, 각 부스 컬러 아이콘 + 이름 + 금액)

**부스 목록:**
- 리스트 UI 사용 (카드가 아닌 리스트 — 토스증권 종목 목록처럼)
- 왼쪽: 부스 컬러 원형 아이콘 (이모지 또는 이니셜)
- 중간: 부스명 + 카테고리 (보조 텍스트)
- 오른쪽: 총 투자금액
- 구분선으로 항목 분리

**부스 상세:**
- 상단: 부스명 + 카테고리 배지
- 투자 현황 섹션: "전체 투자금" (크게) + "내 투자금" (보조)
- 설명 텍스트 영역
- 하단 고정: "투자하기" / "철회하기" 버튼 2개 나란히 배치
  - 투자하기: #F04452 (빨간 배경)
  - 철회하기: #3182F6 (파란 배경)

**투자/철회 바텀시트 (모달):**
- 하단에서 올라오는 바텀시트 형태 (토스 스타일)
- 금액 단위 선택 버튼: [+1만] [+5만] [+10만] [+50만] — 알약(pill) 형태로 나란히
- 선택된 총 금액 크게 표시
- 하단: "투자하기" 또는 "철회하기" 확인 버튼

**포트폴리오:**
- 상단: 총 자산 요약 (보유 코인 + 투자 코인 = 총 자산)
- 도넛 차트로 부스별 투자 비율 시각화
- 하단: 부스별 투자 상세 리스트

**투자 이력:**
- 시간순 리스트 (최신순)
- 각 항목: 부스 아이콘 + 부스명 + 투자/철회 뱃지 + 금액 + 시간
- 투자: 빨간색 텍스트 (+50,000)
- 철회: 파란색 텍스트 (-30,000)
- 날짜별 그룹핑

### 인터랙션 & 애니메이션

- 페이지 전환: 부드러운 슬라이드 트랜지션
- 바텀시트: 하단에서 부드럽게 올라오는 애니메이션
- 금액 변경: 숫자 카운팅 애니메이션 (잔액 변화 시)
- 버튼 탭: 미세한 스케일 피드백 (0.97 → 1.0)
- 투자 성공: 간단한 체크 아이콘 + 초록색 토스트 메시지
- 리스트 아이템: fade-in 스태거 애니메이션 (목록 로딩 시)

### 반응형 처리

- 기본: 모바일 (max-width: 480px 기준 설계)
- 태블릿/PC: max-width 480px 고정 + 중앙 정렬 (토스 앱처럼 모바일 프레임 유지)
- PC에서 접속해도 모바일 앱 느낌을 유지하도록 컨테이너 폭 제한
