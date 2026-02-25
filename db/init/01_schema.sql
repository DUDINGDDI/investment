-- ============================================
-- 부스 투자 시뮬레이터 DB 스키마
-- ============================================

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
USE booth_invest;

-- 사용자 테이블
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    unique_code VARCHAR(20) NOT NULL UNIQUE COMMENT '학번/사번 등 고유 코드',
    name VARCHAR(50) NOT NULL COMMENT '사용자 이름',
    balance BIGINT NOT NULL DEFAULT 100000000 COMMENT '보유 코인 잔액',
    belonging_booth_id BIGINT NULL COMMENT '소속 부스 ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_unique_code (unique_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 구역(Zone) 테이블
CREATE TABLE zones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    zone_code VARCHAR(20) NOT NULL UNIQUE COMMENT '구역 코드 (101, 102, 손복남홀 등)',
    name VARCHAR(100) NOT NULL COMMENT '구역 이름',
    floor_info VARCHAR(50) COMMENT '층/건물 정보',
    display_order INT NOT NULL COMMENT '표시 순서',
    INDEX idx_zone_code (zone_code),
    INDEX idx_display_order (display_order)
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
    zone_id BIGINT COMMENT '소속 구역 ID',
    booth_uuid VARCHAR(36) NOT NULL UNIQUE COMMENT '부스 QR UUID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE SET NULL,
    INDEX idx_display_order (display_order),
    INDEX idx_zone_id (zone_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- users 테이블에 소속 부스 FK 추가 (booths 테이블 생성 후)
ALTER TABLE users ADD FOREIGN KEY (belonging_booth_id) REFERENCES booths(id) ON DELETE SET NULL;

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

-- 앱 설정 테이블
CREATE TABLE app_settings (
    setting_key VARCHAR(50) PRIMARY KEY,
    setting_value VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 유저 미션 진행 테이블
CREATE TABLE user_missions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    mission_id VARCHAR(30) NOT NULL COMMENT '미션 ID (renew, dream, result, again, sincere, together)',
    progress INT NOT NULL DEFAULT 0 COMMENT '현재 진행도',
    target INT NOT NULL DEFAULT 0 COMMENT '목표 수치',
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at DATETIME NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_mission (user_id, mission_id),
    INDEX idx_mission_id (mission_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 부스 방문 기록 테이블
CREATE TABLE booth_visits (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    booth_id BIGINT NOT NULL,
    visited_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (booth_id) REFERENCES booths(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_booth_visit (user_id, booth_id),
    INDEX idx_user_id (user_id),
    INDEX idx_booth_id (booth_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 주식 부스 테이블 (오전 세션용, 투자 부스와 별도)
CREATE TABLE stock_booths (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '주식 부스 이름',
    category VARCHAR(50) NOT NULL COMMENT '카테고리',
    description TEXT COMMENT '부스 상세 설명',
    short_description VARCHAR(200) COMMENT '한줄 소개',
    display_order INT NOT NULL COMMENT '표시 순서',
    logo_emoji VARCHAR(10) COMMENT '대표 이모지',
    theme_color VARCHAR(7) NOT NULL DEFAULT '#3182F6' COMMENT '테마 색상 HEX',
    booth_uuid VARCHAR(36) NOT NULL UNIQUE COMMENT '부스 QR UUID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 주식 부스 방문 기록 테이블
CREATE TABLE stock_booth_visits (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    stock_booth_id BIGINT NOT NULL,
    visited_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (stock_booth_id) REFERENCES stock_booths(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_stock_booth_visit (user_id, stock_booth_id),
    INDEX idx_user_id (user_id),
    INDEX idx_stock_booth_id (stock_booth_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 주식 계좌 테이블
CREATE TABLE stock_accounts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    balance BIGINT NOT NULL DEFAULT 100000000 COMMENT '주식 계좌 잔액',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 주식 보유 현황 테이블
CREATE TABLE stock_holdings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    stock_booth_id BIGINT NOT NULL,
    amount BIGINT NOT NULL DEFAULT 0 COMMENT '보유 수량',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (stock_booth_id) REFERENCES stock_booths(id) ON DELETE CASCADE,
    UNIQUE KEY uk_stock_user_booth (user_id, stock_booth_id),
    INDEX idx_user_id (user_id),
    INDEX idx_stock_booth_id (stock_booth_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 주식 가격 테이블
CREATE TABLE stock_prices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    stock_booth_id BIGINT NOT NULL UNIQUE,
    current_price BIGINT NOT NULL DEFAULT 1000000000 COMMENT '현재 주가',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (stock_booth_id) REFERENCES stock_booths(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 주식 가격 이력 테이블
CREATE TABLE stock_price_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    stock_booth_id BIGINT NOT NULL,
    price BIGINT NOT NULL COMMENT '가격',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stock_booth_id) REFERENCES stock_booths(id) ON DELETE CASCADE,
    INDEX idx_stock_booth_created (stock_booth_id, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 주식 거래 이력 테이블
CREATE TABLE stock_trade_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    stock_booth_id BIGINT NOT NULL,
    type ENUM('BUY', 'SELL') NOT NULL COMMENT '매수 or 매도',
    amount BIGINT NOT NULL COMMENT '거래 수량',
    price_at_trade BIGINT NOT NULL COMMENT '거래 시 가격',
    balance_after BIGINT NOT NULL COMMENT '거래 후 잔액',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (stock_booth_id) REFERENCES stock_booths(id) ON DELETE CASCADE,
    INDEX idx_user_created (user_id, created_at DESC),
    INDEX idx_stock_booth_id (stock_booth_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 주식 댓글 테이블
CREATE TABLE stock_comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    stock_booth_id BIGINT NOT NULL,
    content VARCHAR(500) NOT NULL COMMENT '댓글 내용',
    tag VARCHAR(20) NOT NULL COMMENT '태그 (PROFITABILITY, TECHNOLOGY, GROWTH)',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (stock_booth_id) REFERENCES stock_booths(id) ON DELETE CASCADE,
    INDEX idx_stock_booth_created (stock_booth_id, created_at DESC),
    INDEX idx_stock_booth_tag (stock_booth_id, tag)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 부스 평가 테이블
CREATE TABLE stock_ratings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    stock_booth_id BIGINT NOT NULL,
    score_first INT NOT NULL COMMENT '최초 (1~5)',
    score_best INT NOT NULL COMMENT '최고 (1~5)',
    score_different INT NOT NULL COMMENT '차별화 (1~5)',
    score_number_one INT NOT NULL COMMENT '일등 (1~5)',
    score_gap INT NOT NULL COMMENT '초격차 (1~5)',
    score_global INT NOT NULL COMMENT '글로벌 (1~5)',
    review VARCHAR(500) NULL COMMENT '텍스트 리뷰 (선택)',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (stock_booth_id) REFERENCES stock_booths(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_booth_rating (user_id, stock_booth_id),
    INDEX idx_stock_booth_id (stock_booth_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 쪽지 테이블
CREATE TABLE notes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    content VARCHAR(50) NOT NULL COMMENT '쪽지 내용 (50자 이내)',
    is_read BOOLEAN NOT NULL DEFAULT FALSE COMMENT '읽음 여부',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_receiver_created (receiver_id, created_at DESC),
    INDEX idx_sender_created (sender_id, created_at DESC)
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
