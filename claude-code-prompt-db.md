# MySQL Docker 환경 구성 + 초기 데이터 프롬프트

## 개요

부스 투자 시뮬레이터 프로젝트의 MySQL 데이터베이스를 Docker로 구성해줘.
Spring Boot 백엔드와 연결할 수 있도록 설정하고, 초기 스키마와 시드 데이터를 포함해야 한다.

---

## Docker 구성

### docker-compose.yml

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: booth-invest-db
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root1234
      MYSQL_DATABASE: booth_invest
      MYSQL_USER: booth_user
      MYSQL_PASSWORD: booth1234
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./init:/docker-entrypoint-initdb.d
    command:
      - --character-set-server=utf8mb4
      - --collation-server=utf8mb4_unicode_ci
      - --default-authentication-plugin=mysql_native_password

volumes:
  mysql_data:
```

### 디렉토리 구조

```
db/
├── docker-compose.yml
└── init/
    ├── 01_schema.sql
    └── 02_seed_data.sql
```

`init/` 폴더 안의 SQL 파일들은 컨테이너 최초 실행 시 알파벳순으로 자동 실행된다.

---

## Spring Boot 연결 설정 (application.yml 참고)

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/booth_invest?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Seoul&characterEncoding=UTF-8
    username: booth_user
    password: booth1234
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQLDialect
        format_sql: true
    show-sql: true
```

---

## 01_schema.sql — 테이블 스키마

```sql
-- ============================================
-- 부스 투자 시뮬레이터 DB 스키마
-- ============================================

USE booth_invest;

-- 사용자 테이블
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    unique_code VARCHAR(20) NOT NULL UNIQUE COMMENT '학번/사번 등 고유 코드',
    name VARCHAR(50) NOT NULL COMMENT '사용자 이름',
    balance BIGINT NOT NULL DEFAULT 1000000 COMMENT '보유 코인 잔액',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_unique_code (unique_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 부스 테이블
CREATE TABLE booths (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '부스 이름',
    category VARCHAR(50) NOT NULL COMMENT '카테고리',
    description TEXT COMMENT '부스 상세 설명',
    short_description VARCHAR(200) COMMENT '한줄 소개',
    display_order INT NOT NULL COMMENT '발표 순서 (1~11)',
    logo_emoji VARCHAR(10) COMMENT '대표 이모지',
    theme_color VARCHAR(7) NOT NULL DEFAULT '#3182F6' COMMENT '테마 색상 HEX',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 투자 현황 테이블 (유저-부스 간 현재 투자금)
CREATE TABLE investments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    booth_id BIGINT NOT NULL,
    amount BIGINT NOT NULL DEFAULT 0 COMMENT '현재 투자 금액',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (booth_id) REFERENCES booths(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_booth (user_id, booth_id),
    INDEX idx_user_id (user_id),
    INDEX idx_booth_id (booth_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 투자 이력 테이블
CREATE TABLE investment_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    booth_id BIGINT NOT NULL,
    type ENUM('INVEST', 'WITHDRAW') NOT NULL COMMENT '투자 or 철회',
    amount BIGINT NOT NULL COMMENT '거래 금액',
    balance_after BIGINT NOT NULL COMMENT '거래 후 잔액',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (booth_id) REFERENCES booths(id) ON DELETE CASCADE,
    INDEX idx_user_created (user_id, created_at DESC),
    INDEX idx_booth_id (booth_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 02_seed_data.sql — 초기 데이터

```sql
-- ============================================
-- 초기 시드 데이터
-- ============================================

USE booth_invest;

-- ──────────────────────────────────────────────
-- 11개 부스 데이터
-- ──────────────────────────────────────────────

INSERT INTO booths (name, category, description, short_description, display_order, logo_emoji, theme_color) VALUES

-- 1번 부스
('스텔라 AI',
 '인공지능',
 '차세대 생성형 AI 플랫폼입니다. 자연어 처리와 이미지 생성을 결합한 멀티모달 AI 서비스를 제공하며, 기업용 맞춤 AI 솔루션을 통해 업무 자동화와 생산성 향상을 돕습니다. 현재 50개 이상의 기업 고객을 확보하고 있으며, 월간 활성 사용자 수가 빠르게 성장 중입니다.',
 '멀티모달 AI 기반 기업용 자동화 솔루션',
 1, '🤖', '#6C5CE7'),

-- 2번 부스
('그린웨이브',
 '친환경 에너지',
 '해양 에너지를 활용한 친환경 발전 시스템을 개발하고 있습니다. 파도와 조류를 이용해 전력을 생산하는 혁신적 기술로, 기존 풍력·태양광 대비 안정적인 발전량을 확보할 수 있습니다. 제주도 해안에서 파일럿 프로젝트를 성공적으로 운영 중이며, 동남아 시장 진출을 준비하고 있습니다.',
 '해양 에너지 기반 차세대 친환경 발전',
 2, '🌊', '#00B894'),

-- 3번 부스
('메디케어 플러스',
 '헬스케어',
 'AI 기반 원격 진료 및 건강 관리 플랫폼입니다. 환자의 건강 데이터를 실시간 분석하여 맞춤형 건강 관리 솔루션을 제공합니다. 만성질환 관리에 특화되어 있으며, 전국 200여 개 병원과 제휴를 맺고 서비스를 확대 중입니다. 원격 모니터링 기술로 재입원율을 30% 감소시킨 실적이 있습니다.',
 'AI 원격 진료 & 맞춤형 건강 관리',
 3, '🏥', '#E17055'),

-- 4번 부스
('핀테크 브릿지',
 '금융',
 '블록체인 기반의 크로스보더 결제 시스템을 운영합니다. 기존 해외 송금 대비 수수료를 80% 이상 절감하며, 실시간 송금이 가능합니다. 현재 한국-동남아 간 송금 서비스를 제공 중이며, 일본·유럽 시장으로 확장을 계획하고 있습니다. 누적 거래액 500억 원을 돌파했습니다.',
 '블록체인 크로스보더 결제 & 송금',
 4, '💳', '#0984E3'),

-- 5번 부스
('에듀넥스트',
 '교육',
 '개인 맞춤형 AI 튜터링 플랫폼입니다. 학습자의 수준과 학습 패턴을 분석하여 실시간으로 커리큘럼을 조정합니다. 초·중·고 수학·영어 과목에 특화되어 있으며, 평균 성적 향상률 25%를 기록하고 있습니다. 현재 누적 학습자 수 10만 명을 넘어섰습니다.',
 'AI 맞춤형 학습 튜터링 플랫폼',
 5, '📚', '#FDCB6E'),

-- 6번 부스
('어반팜',
 '농업기술',
 '도시형 수직 농장 솔루션을 제공합니다. IoT 센서와 자동화 기술을 결합하여 도심 속에서 신선한 채소를 재배합니다. 기존 농업 대비 물 사용량 95% 절감, 수확량 10배 증가의 효율을 달성했습니다. 서울 강남, 판교에 스마트팜을 운영 중이며, 대형 마트와 직거래 계약을 체결했습니다.',
 'IoT 스마트 수직 농장 솔루션',
 6, '🌱', '#55EFC4'),

-- 7번 부스
('모빌리티 원',
 '모빌리티',
 '자율주행 공유 모빌리티 서비스를 개발하고 있습니다. Level 4 자율주행 기술을 기반으로 한 차세대 이동 수단을 제공하며, 현재 세종시 특별 구역에서 시범 운행 중입니다. 자체 개발한 라이다 센서 기술로 원가를 50% 절감하는 데 성공했으며, 2026년 상용화를 목표로 하고 있습니다.',
 'Level 4 자율주행 공유 모빌리티',
 7, '🚗', '#A29BFE'),

-- 8번 부스
('스페이스랩',
 '우주산업',
 '소형 위성 발사 및 우주 데이터 분석 서비스를 제공합니다. 50kg급 초소형 위성을 자체 개발하여 저비용으로 우주 접근성을 높입니다. 농업, 해양, 환경 모니터링 분야에서 위성 데이터를 활용한 분석 서비스를 제공 중이며, 올해 첫 상업 위성 발사를 앞두고 있습니다.',
 '초소형 위성 발사 & 우주 데이터 분석',
 8, '🛰️', '#FD79A8'),

-- 9번 부스
('사운드버스',
 '엔터테인먼트',
 'AI 작곡 및 음원 제작 플랫폼입니다. 누구나 텍스트 프롬프트만으로 전문가 수준의 음악을 만들 수 있는 크리에이터 툴을 제공합니다. K-POP 작곡가들과 협업하여 학습 데이터를 구축했으며, 생성된 음원의 상업적 사용권을 보장합니다. 월간 생성 음원 수 5만 건을 돌파했습니다.',
 'AI 기반 음악 생성 & 크리에이터 툴',
 9, '🎵', '#E84393'),

-- 10번 부스
('데이터쉴드',
 '보안',
 '양자 암호화 기반의 사이버 보안 솔루션을 제공합니다. 양자 컴퓨터 시대에 대비한 양자 내성 암호(PQC) 기술을 상용화하고 있으며, 국내 금융기관과 정부 기관에 보안 솔루션을 납품하고 있습니다. 국내 최초로 양자 키 분배(QKD) 기반 VPN 서비스를 상용화한 실적이 있습니다.',
 '양자 암호화 차세대 사이버 보안',
 10, '🔐', '#636E72'),

-- 11번 부스
('클린워터텍',
 '환경',
 '나노 필터 기반 수질 정화 기술을 보유하고 있습니다. 오염된 물을 음용수 수준으로 정화하는 포터블 장치를 개발했으며, 개발도상국과 재난 지역에 보급 중입니다. UN 산하 기관과 파트너십을 맺고 아프리카 5개국에 시범 보급을 완료했습니다. ESG 투자 관점에서 높은 관심을 받고 있습니다.',
 '나노 필터 수질 정화 포터블 장치',
 11, '💧', '#74B9FF');


-- ──────────────────────────────────────────────
-- 테스트 유저 데이터 (5명)
-- ──────────────────────────────────────────────

INSERT INTO users (unique_code, name, balance) VALUES
('2024001', '김민준', 730000),   -- 27만 코인 투자한 상태
('2024002', '이서윤', 850000),   -- 15만 코인 투자한 상태
('2024003', '박도현', 1000000),  -- 아직 투자 안 함
('2024004', '최수아', 500000),   -- 50만 코인 투자한 상태
('2024005', '정하준', 620000);   -- 38만 코인 투자한 상태


-- ──────────────────────────────────────────────
-- 테스트 투자 현황 데이터
-- ──────────────────────────────────────────────

-- 김민준 (2024001) - 총 27만 투자
INSERT INTO investments (user_id, booth_id, amount) VALUES
(1, 1, 100000),   -- 스텔라 AI에 10만
(1, 3, 70000),    -- 메디케어 플러스에 7만
(1, 7, 100000);   -- 모빌리티 원에 10만

-- 이서윤 (2024002) - 총 15만 투자
INSERT INTO investments (user_id, booth_id, amount) VALUES
(2, 2, 50000),    -- 그린웨이브에 5만
(2, 5, 50000),    -- 에듀넥스트에 5만
(2, 9, 50000);    -- 사운드버스에 5만

-- 최수아 (2024004) - 총 50만 투자
INSERT INTO investments (user_id, booth_id, amount) VALUES
(4, 1, 200000),   -- 스텔라 AI에 20만
(4, 4, 150000),   -- 핀테크 브릿지에 15만
(4, 8, 150000);   -- 스페이스랩에 15만

-- 정하준 (2024005) - 총 38만 투자
INSERT INTO investments (user_id, booth_id, amount) VALUES
(5, 6, 130000),   -- 어반팜에 13만
(5, 10, 100000),  -- 데이터쉴드에 10만
(5, 11, 150000);  -- 클린워터텍에 15만


-- ──────────────────────────────────────────────
-- 테스트 투자 이력 데이터
-- ──────────────────────────────────────────────

-- 김민준의 투자 이력
INSERT INTO investment_history (user_id, booth_id, type, amount, balance_after, created_at) VALUES
(1, 1, 'INVEST', 150000, 850000, '2026-02-20 09:15:00'),
(1, 3, 'INVEST', 100000, 750000, '2026-02-20 09:32:00'),
(1, 7, 'INVEST', 100000, 650000, '2026-02-20 10:05:00'),
(1, 1, 'WITHDRAW', 50000, 700000, '2026-02-20 10:20:00'),
(1, 3, 'WITHDRAW', 30000, 730000, '2026-02-20 10:45:00');

-- 이서윤의 투자 이력
INSERT INTO investment_history (user_id, booth_id, type, amount, balance_after, created_at) VALUES
(2, 2, 'INVEST', 50000, 950000, '2026-02-20 09:20:00'),
(2, 5, 'INVEST', 50000, 900000, '2026-02-20 09:55:00'),
(2, 9, 'INVEST', 50000, 850000, '2026-02-20 10:30:00');

-- 최수아의 투자 이력
INSERT INTO investment_history (user_id, booth_id, type, amount, balance_after, created_at) VALUES
(4, 1, 'INVEST', 200000, 800000, '2026-02-20 09:10:00'),
(4, 4, 'INVEST', 200000, 600000, '2026-02-20 09:40:00'),
(4, 8, 'INVEST', 150000, 450000, '2026-02-20 10:15:00'),
(4, 4, 'WITHDRAW', 50000, 500000, '2026-02-20 10:50:00');

-- 정하준의 투자 이력
INSERT INTO investment_history (user_id, booth_id, type, amount, balance_after, created_at) VALUES
(5, 6, 'INVEST', 130000, 870000, '2026-02-20 09:25:00'),
(5, 10, 'INVEST', 100000, 770000, '2026-02-20 09:50:00'),
(5, 11, 'INVEST', 200000, 570000, '2026-02-20 10:10:00'),
(5, 11, 'WITHDRAW', 50000, 620000, '2026-02-20 10:35:00');


-- ──────────────────────────────────────────────
-- 데이터 확인용 쿼리 (참고용)
-- ──────────────────────────────────────────────

-- 부스별 총 투자금액 확인
-- SELECT b.name, COALESCE(SUM(i.amount), 0) AS total_invested
-- FROM booths b
-- LEFT JOIN investments i ON b.id = i.booth_id
-- GROUP BY b.id
-- ORDER BY b.display_order;

-- 특정 유저의 포트폴리오 확인
-- SELECT b.name, b.theme_color, i.amount
-- FROM investments i
-- JOIN booths b ON i.booth_id = b.id
-- WHERE i.user_id = 1
-- ORDER BY i.amount DESC;

-- 특정 유저의 투자 이력 확인
-- SELECT b.name, ih.type, ih.amount, ih.balance_after, ih.created_at
-- FROM investment_history ih
-- JOIN booths b ON ih.booth_id = b.id
-- WHERE ih.user_id = 1
-- ORDER BY ih.created_at DESC;
```

---

## 실행 방법

```bash
# 1. db 폴더로 이동
cd db

# 2. Docker 컨테이너 실행 (백그라운드)
docker-compose up -d

# 3. 정상 실행 확인
docker-compose logs -f mysql

# 4. MySQL 접속 테스트
docker exec -it booth-invest-db mysql -u booth_user -pbooth1234 booth_invest

# 5. 데이터 확인
# mysql> SELECT * FROM booths;
# mysql> SELECT * FROM users;

# 6. 컨테이너 종료
docker-compose down

# 7. 볼륨 포함 완전 초기화 (데이터 삭제)
docker-compose down -v
```

---

## 주의사항

1. **init 폴더의 SQL은 최초 실행 시에만 적용된다.** 이미 볼륨이 존재하면 무시됨. 스키마를 변경하려면 `docker-compose down -v`로 볼륨을 삭제 후 다시 실행.
2. **포트 충돌**: 로컬에 MySQL이 이미 설치되어 있으면 3306 포트가 충돌할 수 있다. 이 경우 `ports`를 `"3307:3306"`으로 변경하고, Spring Boot의 datasource url도 포트를 맞춰서 수정.
3. **문자셋**: utf8mb4로 설정되어 있어 이모지 저장이 가능하다.
4. **테스트 유저 비밀번호**: 이 프로젝트는 학번/사번 + 이름으로만 인증하므로 별도 비밀번호 컬럼이 없다.
