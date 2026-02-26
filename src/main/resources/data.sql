SET REFERENTIAL_INTEGRITY FALSE;

TRUNCATE TABLE investment_history;
TRUNCATE TABLE investments;
TRUNCATE TABLE booth_visits;
TRUNCATE TABLE user_missions;
TRUNCATE TABLE notes;
TRUNCATE TABLE stock_comments;
TRUNCATE TABLE stock_ratings;
TRUNCATE TABLE stock_trade_history;
TRUNCATE TABLE stock_price_history;
TRUNCATE TABLE stock_prices;
TRUNCATE TABLE stock_holdings;
TRUNCATE TABLE stock_accounts;
TRUNCATE TABLE stock_booth_visits;
TRUNCATE TABLE users;
TRUNCATE TABLE stock_booths;
TRUNCATE TABLE booths;

SET REFERENTIAL_INTEGRITY TRUE;

INSERT INTO app_settings (setting_key, setting_value) VALUES ('results_revealed', 'false');
INSERT INTO app_settings (setting_key, setting_value) VALUES ('investment_enabled', 'true');

INSERT INTO zones (zone_code, name, floor_info, display_order) VALUES
('손복남홀', '손복남홀', 'INNOVATION CENTER LL', 1),
('L01', 'L01', 'INNOVATION CENTER LL', 2),
('L02', 'L02', 'INNOVATION CENTER LL', 3),
('101', '101호', 'LEADERSHIP CENTER 1F', 4),
('102', '102호', 'LEADERSHIP CENTER 1F', 5),
('201', '201호', 'LEADERSHIP CENTER 2F', 6);

-- ──────────────────────────────────────────────
-- users (8명)
-- ──────────────────────────────────────────────
INSERT INTO users (unique_code, name, company, balance, belonging_booth_id) VALUES
('U001', '김기범', 'CJ제일제당', 100000000, NULL),
('U002', '정민창', 'CJ대한통운', 100000000, NULL),
('U003', '오현지', 'CJ ENM', 100000000, NULL),
('U004', '임정한', 'CJ올리브영', 100000000, NULL),
('U005', '박민지', 'CJ프레시웨이', 100000000, NULL),
('U006', '신예린', 'CJ제일제당', 100000000, NULL),
('U007', '엄지윤', 'CJ대한통운', 100000000, NULL),
('U008', '문선우', 'CJ ENM', 100000000, NULL);


-- ──────────────────────────────────────────────
-- booths (CJ그룹 계열사 9개)
-- ──────────────────────────────────────────────
INSERT INTO booths (name, category, description, short_description, display_order, logo_emoji, theme_color, zone_id, booth_uuid) VALUES
('CJ제일제당', '식품/바이오',
 '글로벌 식품 및 바이오 기업으로 비비고, 햇반 등 대표 브랜드를 보유하고 있습니다. 바이오 사업에서는 아미노산, 핵산 등 세계 1위 품목을 다수 확보하며 글로벌 시장을 선도하고 있습니다.',
 '글로벌 식품·바이오 No.1 기업', 1, '🍚', '#E74C3C', 1, RANDOM_UUID()),

('CJ대한통운', '물류',
 '국내 최대 종합 물류 기업으로 택배, 글로벌 포워딩, 계약 물류 사업을 영위합니다. AI 기반 스마트 물류 시스템과 자동화 허브를 통해 물류 혁신을 이끌고 있습니다.',
 '국내 1위 종합 물류 플랫폼', 2, '📦', '#3498DB', 1, RANDOM_UUID()),

('CJ ENM', '엔터테인먼트',
 '미디어·콘텐츠·음악 사업을 아우르는 종합 엔터테인먼트 기업입니다. tvN, Mnet 등 채널을 운영하고 글로벌 콘텐츠 제작·유통을 통해 K-컬처 확산을 주도합니다.',
 '글로벌 K-콘텐츠 엔터테인먼트', 3, '🎬', '#9B59B6', 1, RANDOM_UUID()),

('CJ올리브영', '헬스&뷰티',
 '국내 1위 헬스앤뷰티 리테일 플랫폼입니다. 전국 1,300여 개 매장과 온라인몰을 운영하며 K-뷰티 트렌드를 선도하고 있습니다.',
 '국내 1위 헬스앤뷰티 플랫폼', 4, '💄', '#E91E63', 2, RANDOM_UUID()),

('CJ올리브네트웍스', 'IT/디지털',
 'CJ그룹의 디지털 전환을 담당하는 IT 서비스 기업입니다. 클라우드, AI, 데이터 분석 등 디지털 기술로 그룹사 및 외부 고객의 DX를 지원합니다.',
 'CJ그룹 디지털 전환 IT 서비스', 5, '💻', '#2196F3', 2, RANDOM_UUID()),

('CJ CGV', '영화/극장',
 '글로벌 멀티플렉스 극장 체인으로 한국, 베트남, 인도네시아 등에서 극장을 운영합니다. 4DX, ScreenX 등 특별관 기술로 차별화된 관람 경험을 제공합니다.',
 '글로벌 멀티플렉스 극장 체인', 6, '🎥', '#F39C12', 2, RANDOM_UUID()),

('CJ프레시웨이', '식자재 유통',
 '국내 대표 식자재 유통 기업으로 단체급식, 외식, 식품 유통 사업을 운영합니다. 산지 직소싱과 콜드체인 시스템으로 신선한 식자재를 공급합니다.',
 '식자재 유통·단체급식 전문 기업', 7, '🥬', '#27AE60', 3, RANDOM_UUID()),

('CJ푸드빌', '외식',
 '빕스, 뚜레쥬르, 더플레이스 등 외식 브랜드를 운영하는 종합 외식 기업입니다. 베이커리, 레스토랑 등 다양한 외식 경험을 제공합니다.',
 '빕스·뚜레쥬르 종합 외식 기업', 8, '🍽️', '#E67E22', 3, RANDOM_UUID()),

('CJ온스타일', '커머스',
 'TV홈쇼핑, 라이브커머스, 모바일 쇼핑을 아우르는 멀티채널 커머스 플랫폼입니다. 데이터 기반 큐레이션으로 차별화된 쇼핑 경험을 제공합니다.',
 '멀티채널 라이브 커머스 플랫폼', 9, '🛍️', '#FF6348', 3, RANDOM_UUID());

-- ──────────────────────────────────────────────
-- stock_booths (CJ그룹 계열사 9개 - 주식 세션용)
-- ──────────────────────────────────────────────
INSERT INTO stock_booths (name, category, description, short_description, display_order, logo_emoji, theme_color, zone_id, booth_uuid) VALUES
('CJ제일제당', '식품/바이오',
 '글로벌 식품 및 바이오 기업으로 비비고, 햇반 등 대표 브랜드를 보유하고 있습니다. 바이오 사업에서는 아미노산, 핵산 등 세계 1위 품목을 다수 확보하며 글로벌 시장을 선도하고 있습니다.',
 '글로벌 식품·바이오 No.1 기업', 1, '🍚', '#E74C3C', 1, RANDOM_UUID()),

('CJ대한통운', '물류',
 '국내 최대 종합 물류 기업으로 택배, 글로벌 포워딩, 계약 물류 사업을 영위합니다. AI 기반 스마트 물류 시스템과 자동화 허브를 통해 물류 혁신을 이끌고 있습니다.',
 '국내 1위 종합 물류 플랫폼', 2, '📦', '#3498DB', 1, RANDOM_UUID()),

('CJ ENM', '엔터테인먼트',
 '미디어·콘텐츠·음악 사업을 아우르는 종합 엔터테인먼트 기업입니다. tvN, Mnet 등 채널을 운영하고 글로벌 콘텐츠 제작·유통을 통해 K-컬처 확산을 주도합니다.',
 '글로벌 K-콘텐츠 엔터테인먼트', 3, '🎬', '#9B59B6', 1, RANDOM_UUID()),

('CJ올리브영', '헬스&뷰티',
 '국내 1위 헬스앤뷰티 리테일 플랫폼입니다. 전국 1,300여 개 매장과 온라인몰을 운영하며 K-뷰티 트렌드를 선도하고 있습니다.',
 '국내 1위 헬스앤뷰티 플랫폼', 4, '💄', '#E91E63', 2, RANDOM_UUID()),

('CJ올리브네트웍스', 'IT/디지털',
 'CJ그룹의 디지털 전환을 담당하는 IT 서비스 기업입니다. 클라우드, AI, 데이터 분석 등 디지털 기술로 그룹사 및 외부 고객의 DX를 지원합니다.',
 'CJ그룹 디지털 전환 IT 서비스', 5, '💻', '#2196F3', 2, RANDOM_UUID()),

('CJ CGV', '영화/극장',
 '글로벌 멀티플렉스 극장 체인으로 한국, 베트남, 인도네시아 등에서 극장을 운영합니다. 4DX, ScreenX 등 특별관 기술로 차별화된 관람 경험을 제공합니다.',
 '글로벌 멀티플렉스 극장 체인', 6, '🎥', '#F39C12', 2, RANDOM_UUID()),

('CJ프레시웨이', '식자재 유통',
 '국내 대표 식자재 유통 기업으로 단체급식, 외식, 식품 유통 사업을 운영합니다. 산지 직소싱과 콜드체인 시스템으로 신선한 식자재를 공급합니다.',
 '식자재 유통·단체급식 전문 기업', 7, '🥬', '#27AE60', 3, RANDOM_UUID()),

('CJ푸드빌', '외식',
 '빕스, 뚜레쥬르, 더플레이스 등 외식 브랜드를 운영하는 종합 외식 기업입니다. 베이커리, 레스토랑 등 다양한 외식 경험을 제공합니다.',
 '빕스·뚜레쥬르 종합 외식 기업', 8, '🍽️', '#E67E22', 3, RANDOM_UUID()),

('CJ온스타일', '커머스',
 'TV홈쇼핑, 라이브커머스, 모바일 쇼핑을 아우르는 멀티채널 커머스 플랫폼입니다. 데이터 기반 큐레이션으로 차별화된 쇼핑 경험을 제공합니다.',
 '멀티채널 라이브 커머스 플랫폼', 9, '🛍️', '#FF6348', 3, RANDOM_UUID());

-- ──────────────────────────────────────────────
-- stock_prices 초기화 (stock_booths 입력 후 실행)
-- ──────────────────────────────────────────────
INSERT INTO stock_prices (stock_booth_id, current_price)
SELECT id, 1000000000 FROM stock_booths;

-- ──────────────────────────────────────────────
-- booth_visits (8명 × 9부스 = 72건)
-- ──────────────────────────────────────────────
INSERT INTO booth_visits (user_id, booth_id)
SELECT u.id, b.id
FROM users u
CROSS JOIN booths b;

-- ──────────────────────────────────────────────
-- stock_booth_visits (8명 × 9부스 = 72건)
-- ──────────────────────────────────────────────
INSERT INTO stock_booth_visits (user_id, stock_booth_id)
SELECT u.id, sb.id
FROM users u
CROSS JOIN stock_booths sb;

-- ──────────────────────────────────────────────
-- user_missions: U001 김기범 미션 완료 (이용권)
-- ──────────────────────────────────────────────
INSERT INTO user_missions (user_id, mission_id, progress, target, is_completed, completed_at, is_used, used_at)
SELECT u.id, m.mission_id, m.target, m.target, TRUE, CURRENT_TIMESTAMP, FALSE, NULL
FROM users u
CROSS JOIN (
    SELECT 'renew' AS mission_id, 1 AS target UNION ALL
    SELECT 'dream', 1 UNION ALL
    SELECT 'result', 1 UNION ALL
    SELECT 'again', 70 UNION ALL
    SELECT 'sincere', 12 UNION ALL
    SELECT 'together', 1
) m
WHERE u.unique_code = 'U001';
