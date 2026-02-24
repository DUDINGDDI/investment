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
    balance BIGINT NOT NULL DEFAULT 1000000 COMMENT '보유 코인 잔액',
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
