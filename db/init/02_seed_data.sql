-- ============================================
-- 초기 시드 데이터
-- ============================================

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
USE booth_invest;

-- ──────────────────────────────────────────────
-- app_settings
-- ──────────────────────────────────────────────
INSERT INTO app_settings (setting_key, setting_value) VALUES ('results_revealed', 'false');
INSERT INTO app_settings (setting_key, setting_value) VALUES ('investment_enabled', 'true');
INSERT INTO app_settings (setting_key, setting_value) VALUES ('mission_result_revealed', 'false');
INSERT INTO app_settings (setting_key, setting_value) VALUES ('stock_enabled', 'true');
INSERT INTO app_settings (setting_key, setting_value) VALUES ('dream_enabled', 'false');
INSERT INTO app_settings (setting_key, setting_value) VALUES ('stock_ranking_enabled', 'true');

-- ──────────────────────────────────────────────
-- zones (11개)
-- ──────────────────────────────────────────────
INSERT INTO zones (zone_code, name, floor_info, floor, display_order) VALUES
('손복남홀', '손복남홀', 'INNOVATION CENTER LL층', 'Innovation Center', 1),
('L01', 'L01', 'INNOVATION CENTER LL층', 'Innovation Center', 2),
('L02', 'L02', 'INNOVATION CENTER LL층', 'Innovation Center', 3),
('101', '101호', 'LEARNING CENTER 1층', 'Learning Center', 4),
('102', '102호', 'LEARNING CENTER 1층', 'Learning Center', 5),
('201', '201호', 'LEARNING CENTER 2층', 'Learning Center', 6),
('202', '202호', 'LEARNING CENTER 2층', 'Learning Center', 7),
('203', '203호', 'LEARNING CENTER 2층', 'Learning Center', 8),
('204', '204호', 'LEARNING CENTER 2층', 'Learning Center', 9),
('301', '301호', 'LEARNING CENTER 3층', 'Learning Center', 10),
('302', '302호', 'LEARNING CENTER 3층', 'Learning Center', 11);

-- ──────────────────────────────────────────────
-- booths (PM 오후 투자 - 계열사 이름 + "대표작", 10개)
-- ──────────────────────────────────────────────
INSERT INTO booths (name, category, description, short_description, display_order, logo_emoji, theme_color, zone_id, booth_uuid) VALUES
('CJ제일제당 대표작', '식품/바이오',
 '글로벌 식품 및 바이오 기업으로 비비고, 햇반 등 대표 브랜드를 보유하고 있습니다.',
 '글로벌 식품·바이오 No.1 기업', 1, '🍚', '#E74C3C', 1, UUID()),

('CJ대한통운 대표작', '물류',
 '국내 최대 종합 물류 기업으로 택배, 글로벌 포워딩, 계약 물류 사업을 영위합니다.',
 '국내 1위 종합 물류 플랫폼', 2, '📦', '#3498DB', 1, UUID()),

('CJ ENM 대표작', '엔터테인먼트',
 '미디어·콘텐츠·음악 사업을 아우르는 종합 엔터테인먼트 기업입니다.',
 '글로벌 K-콘텐츠 엔터테인먼트', 3, '🎬', '#9B59B6', 1, UUID()),

('CJ올리브영 대표작', '헬스&뷰티',
 '국내 1위 헬스앤뷰티 리테일 플랫폼입니다.',
 '국내 1위 헬스앤뷰티 플랫폼', 4, '💄', '#E91E63', 2, UUID()),

('CJ올리브네트웍스 대표작', 'IT/디지털',
 'CJ그룹의 디지털 전환을 담당하는 IT 서비스 기업입니다.',
 'CJ그룹 디지털 전환 IT 서비스', 5, '💻', '#2196F3', 2, UUID()),

('CJ CGV 대표작', '영화/극장',
 '글로벌 멀티플렉스 극장 체인으로 차별화된 관람 경험을 제공합니다.',
 '글로벌 멀티플렉스 극장 체인', 6, '🎥', '#F39C12', 2, UUID()),

('CJ프레시웨이 대표작', '식자재 유통',
 '국내 대표 식자재 유통 기업으로 단체급식, 외식, 식품 유통 사업을 운영합니다.',
 '식자재 유통·단체급식 전문 기업', 7, '🥬', '#27AE60', 3, UUID()),

('CJ푸드빌 대표작', '외식',
 '빕스, 뚜레쥬르, 더플레이스 등 외식 브랜드를 운영하는 종합 외식 기업입니다.',
 '빕스·뚜레쥬르 종합 외식 기업', 8, '🍽️', '#E67E22', 3, UUID()),

('CJ온스타일 대표작', '커머스',
 'TV홈쇼핑, 라이브커머스, 모바일 쇼핑을 아우르는 멀티채널 커머스 플랫폼입니다.',
 '멀티채널 라이브 커머스 플랫폼', 9, '🛍️', '#FF6348', 3, UUID()),

('CJ인재원 대표작', '교육',
 'CJ그룹의 인재 육성을 담당하는 교육 기관입니다.',
 'CJ그룹 인재 육성 기관', 10, '🎓', '#6C5CE7', 3, UUID());

-- ──────────────────────────────────────────────
-- users (11명 + 하고잡이 + 더미 57명 = 69명)
-- ──────────────────────────────────────────────
INSERT INTO users (unique_code, name, company, balance) VALUES
('U001', '김기범', 'CJ올리브네트웍스', 100000000),
('U002', '박민지', 'CJ제일제당', 100000000),
('U003', '엄지윤', 'CJ올리브영', 100000000),
('U004', '신예린', 'CJ푸드빌', 100000000),
('U005', '정민창', 'CJ대한통운', 100000000),
('U006', '오현지', 'CJ ENM', 100000000),
('U007', '임정한', 'CJ프레시웨이', 100000000),
('U008', '강슬기', 'CJ인재원', 100000000),
('U009', '장한빈', 'CJ인재원', 100000000),
('U010', '한필우', 'CJ인재원', 100000000),
('U011', '문선우', 'CJ인재원', 100000000),
('U999', '하고잡이', NULL, 100000000);

-- 더미 유저 57명 (CJ인재원 방문 69명 달성용)
INSERT INTO users (unique_code, name, company, balance) VALUES
('USER01', 'USER1', NULL, 100000000),
('USER02', 'USER2', NULL, 100000000),
('USER03', 'USER3', NULL, 100000000),
('USER04', 'USER4', NULL, 100000000),
('USER05', 'USER5', NULL, 100000000),
('USER06', 'USER6', NULL, 100000000),
('USER07', 'USER7', NULL, 100000000),
('USER08', 'USER8', NULL, 100000000),
('USER09', 'USER9', NULL, 100000000),
('USER10', 'USER10', NULL, 100000000),
('USER11', 'USER11', NULL, 100000000),
('USER12', 'USER12', NULL, 100000000),
('USER13', 'USER13', NULL, 100000000),
('USER14', 'USER14', NULL, 100000000),
('USER15', 'USER15', NULL, 100000000),
('USER16', 'USER16', NULL, 100000000),
('USER17', 'USER17', NULL, 100000000),
('USER18', 'USER18', NULL, 100000000),
('USER19', 'USER19', NULL, 100000000),
('USER20', 'USER20', NULL, 100000000),
('USER21', 'USER21', NULL, 100000000),
('USER22', 'USER22', NULL, 100000000),
('USER23', 'USER23', NULL, 100000000),
('USER24', 'USER24', NULL, 100000000),
('USER25', 'USER25', NULL, 100000000),
('USER26', 'USER26', NULL, 100000000),
('USER27', 'USER27', NULL, 100000000),
('USER28', 'USER28', NULL, 100000000),
('USER29', 'USER29', NULL, 100000000),
('USER30', 'USER30', NULL, 100000000),
('USER31', 'USER31', NULL, 100000000),
('USER32', 'USER32', NULL, 100000000),
('USER33', 'USER33', NULL, 100000000),
('USER34', 'USER34', NULL, 100000000),
('USER35', 'USER35', NULL, 100000000),
('USER36', 'USER36', NULL, 100000000),
('USER37', 'USER37', NULL, 100000000),
('USER38', 'USER38', NULL, 100000000),
('USER39', 'USER39', NULL, 100000000),
('USER40', 'USER40', NULL, 100000000),
('USER41', 'USER41', NULL, 100000000),
('USER42', 'USER42', NULL, 100000000),
('USER43', 'USER43', NULL, 100000000),
('USER44', 'USER44', NULL, 100000000),
('USER45', 'USER45', NULL, 100000000),
('USER46', 'USER46', NULL, 100000000),
('USER47', 'USER47', NULL, 100000000),
('USER48', 'USER48', NULL, 100000000),
('USER49', 'USER49', NULL, 100000000),
('USER50', 'USER50', NULL, 100000000),
('USER51', 'USER51', NULL, 100000000),
('USER52', 'USER52', NULL, 100000000),
('USER53', 'USER53', NULL, 100000000),
('USER54', 'USER54', NULL, 100000000),
('USER55', 'USER55', NULL, 100000000),
('USER56', 'USER56', NULL, 100000000),
('USER57', 'USER57', NULL, 100000000);

-- ──────────────────────────────────────────────
-- stock_booths (AM 오전 투자 - 계열사별 1번/2번부스 + CJ인재원, 19개)
-- ──────────────────────────────────────────────
INSERT INTO stock_booths (name, category, description, short_description, display_order, logo_emoji, theme_color, zone_id, booth_uuid) VALUES
('CJ제일제당 1번부스', '식품/바이오',
 '글로벌 식품 및 바이오 기업으로 비비고, 햇반 등 대표 브랜드를 보유하고 있습니다.',
 '글로벌 식품·바이오 No.1 기업', 1, '🍚', '#E74C3C', 1, UUID()),
('CJ제일제당 2번부스', '식품/바이오',
 '바이오 사업에서 아미노산, 핵산 등 세계 1위 품목을 다수 확보하며 글로벌 시장을 선도합니다.',
 '글로벌 식품·바이오 No.1 기업', 2, '🍚', '#E74C3C', 1, UUID()),

('CJ대한통운 1번부스', '물류',
 '국내 최대 종합 물류 기업으로 택배, 글로벌 포워딩, 계약 물류 사업을 영위합니다.',
 '국내 1위 종합 물류 플랫폼', 3, '📦', '#3498DB', 1, UUID()),
('CJ대한통운 2번부스', '물류',
 'AI 기반 스마트 물류 시스템과 자동화 허브를 통해 물류 혁신을 이끌고 있습니다.',
 '국내 1위 종합 물류 플랫폼', 4, '📦', '#3498DB', 1, UUID()),

('CJ ENM 1번부스', '엔터테인먼트',
 '미디어·콘텐츠·음악 사업을 아우르는 종합 엔터테인먼트 기업입니다.',
 '글로벌 K-콘텐츠 엔터테인먼트', 5, '🎬', '#9B59B6', 1, UUID()),
('CJ ENM 2번부스', '엔터테인먼트',
 'tvN, Mnet 등 채널을 운영하고 글로벌 콘텐츠 제작·유통을 통해 K-컬처 확산을 주도합니다.',
 '글로벌 K-콘텐츠 엔터테인먼트', 6, '🎬', '#9B59B6', 1, UUID()),

('CJ올리브영 1번부스', '헬스&뷰티',
 '국내 1위 헬스앤뷰티 리테일 플랫폼입니다.',
 '국내 1위 헬스앤뷰티 플랫폼', 7, '💄', '#E91E63', 2, UUID()),
('CJ올리브영 2번부스', '헬스&뷰티',
 '전국 1,300여 개 매장과 온라인몰을 운영하며 K-뷰티 트렌드를 선도하고 있습니다.',
 '국내 1위 헬스앤뷰티 플랫폼', 8, '💄', '#E91E63', 2, UUID()),

('CJ올리브네트웍스 1번부스', 'IT/디지털',
 'CJ그룹의 디지털 전환을 담당하는 IT 서비스 기업입니다.',
 'CJ그룹 디지털 전환 IT 서비스', 9, '💻', '#2196F3', 2, UUID()),
('CJ올리브네트웍스 2번부스', 'IT/디지털',
 '클라우드, AI, 데이터 분석 등 디지털 기술로 그룹사 및 외부 고객의 DX를 지원합니다.',
 'CJ그룹 디지털 전환 IT 서비스', 10, '💻', '#2196F3', 2, UUID()),

('CJ CGV 1번부스', '영화/극장',
 '글로벌 멀티플렉스 극장 체인으로 한국, 베트남, 인도네시아 등에서 극장을 운영합니다.',
 '글로벌 멀티플렉스 극장 체인', 11, '🎥', '#F39C12', 2, UUID()),
('CJ CGV 2번부스', '영화/극장',
 '4DX, ScreenX 등 특별관 기술로 차별화된 관람 경험을 제공합니다.',
 '글로벌 멀티플렉스 극장 체인', 12, '🎥', '#F39C12', 2, 'a1b2c3d4-0001-4000-8000-000000000001'),

('CJ프레시웨이 1번부스', '식자재 유통',
 '국내 대표 식자재 유통 기업으로 단체급식, 외식, 식품 유통 사업을 운영합니다.',
 '식자재 유통·단체급식 전문 기업', 13, '🥬', '#27AE60', 3, UUID()),
('CJ프레시웨이 2번부스', '식자재 유통',
 '산지 직소싱과 콜드체인 시스템으로 신선한 식자재를 공급합니다.',
 '식자재 유통·단체급식 전문 기업', 14, '🥬', '#27AE60', 3, 'a1b2c3d4-0002-4000-8000-000000000002'),

('CJ푸드빌 1번부스', '외식',
 '빕스, 뚜레쥬르, 더플레이스 등 외식 브랜드를 운영하는 종합 외식 기업입니다.',
 '빕스·뚜레쥬르 종합 외식 기업', 15, '🍽️', '#E67E22', 3, UUID()),
('CJ푸드빌 2번부스', '외식',
 '베이커리, 레스토랑 등 다양한 외식 경험을 제공합니다.',
 '빕스·뚜레쥬르 종합 외식 기업', 16, '🍽️', '#E67E22', 3, 'a1b2c3d4-0003-4000-8000-000000000003'),

('CJ온스타일 1번부스', '커머스',
 'TV홈쇼핑, 라이브커머스, 모바일 쇼핑을 아우르는 멀티채널 커머스 플랫폼입니다.',
 '멀티채널 라이브 커머스 플랫폼', 17, '🛍️', '#FF6348', 3, 'a1b2c3d4-0004-4000-8000-000000000004'),
('CJ온스타일 2번부스', '커머스',
 '데이터 기반 큐레이션으로 차별화된 쇼핑 경험을 제공합니다.',
 '멀티채널 라이브 커머스 플랫폼', 18, '🛍️', '#FF6348', 3, 'a1b2c3d4-0005-4000-8000-000000000005'),

('CJ인재원', '교육',
 'CJ그룹의 인재 육성을 담당하는 교육 기관입니다.',
 'CJ그룹 인재 육성 기관', 19, '🎓', '#6C5CE7', 3, UUID());

-- ──────────────────────────────────────────────
-- 소속 stock_booth 매핑 (각 유저 → 특정 1개 stock_booth)
-- ──────────────────────────────────────────────
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE name = 'CJ올리브네트웍스 1번부스') WHERE unique_code = 'U001';
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE name = 'CJ제일제당 1번부스') WHERE unique_code = 'U002';
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE name = 'CJ올리브영 2번부스') WHERE unique_code = 'U003';
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE name = 'CJ푸드빌 1번부스') WHERE unique_code = 'U004';
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE name = 'CJ대한통운 2번부스') WHERE unique_code = 'U005';
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE name = 'CJ ENM 1번부스') WHERE unique_code = 'U006';
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE name = 'CJ프레시웨이 2번부스') WHERE unique_code = 'U007';
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE name = 'CJ인재원') WHERE unique_code = 'U008';
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE name = 'CJ인재원') WHERE unique_code = 'U009';
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE name = 'CJ인재원') WHERE unique_code = 'U010';
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE name = 'CJ인재원') WHERE unique_code = 'U011';

-- ──────────────────────────────────────────────
-- stock_prices 초기화
-- ──────────────────────────────────────────────
INSERT INTO stock_prices (stock_booth_id, current_price)
SELECT id, 1000000000 FROM stock_booths;

-- ──────────────────────────────────────────────
-- stock_accounts (12명 메인 유저)
-- ──────────────────────────────────────────────
INSERT INTO stock_accounts (user_id, balance)
SELECT id, 100000000 FROM users WHERE unique_code IN ('U001','U002','U003','U004','U005','U006','U007','U008','U009','U010','U011','U999');

-- ──────────────────────────────────────────────
-- stock_booth_visits
-- 메인 12명: 미방문 5개 부스 제외하고 방문
-- 더미 57명: CJ인재원만 방문 → CJ인재원 총 69명
-- 미방문 부스: CJ CGV 2번부스, CJ프레시웨이 2번부스, CJ푸드빌 2번부스, CJ온스타일 1번부스, CJ온스타일 2번부스
-- ──────────────────────────────────────────────
INSERT INTO stock_booth_visits (user_id, stock_booth_id)
SELECT u.id, sb.id
FROM users u
CROSS JOIN stock_booths sb
WHERE u.unique_code IN ('U001','U002','U003','U004','U005','U006','U007','U008','U009','U010','U011','U999')
AND sb.name NOT IN ('CJ CGV 2번부스', 'CJ프레시웨이 2번부스', 'CJ푸드빌 2번부스', 'CJ온스타일 1번부스', 'CJ온스타일 2번부스');

INSERT INTO stock_booth_visits (user_id, stock_booth_id)
SELECT u.id, sb.id
FROM users u
CROSS JOIN stock_booths sb
WHERE u.unique_code LIKE 'USER%'
AND sb.name = 'CJ인재원';

-- ──────────────────────────────────────────────
-- stock_ratings: 인재원 4명 + 김기범/정민창 × 11개 리뷰 = 66건
-- (자기 소속 부스 제외, 다른 stock_booth 11개에 리뷰)
-- ──────────────────────────────────────────────
INSERT INTO stock_ratings (user_id, stock_booth_id, score_first, score_best, score_different, score_number_one, score_gap, score_global, review)
SELECT u.id, sb.id,
  CASE (sb.id % 5) WHEN 0 THEN 5 WHEN 1 THEN 4 WHEN 2 THEN 5 WHEN 3 THEN 3 WHEN 4 THEN 4 END,
  CASE (sb.id % 5) WHEN 0 THEN 4 WHEN 1 THEN 5 WHEN 2 THEN 4 WHEN 3 THEN 5 WHEN 4 THEN 3 END,
  CASE (sb.id % 5) WHEN 0 THEN 5 WHEN 1 THEN 3 WHEN 2 THEN 4 WHEN 3 THEN 4 WHEN 4 THEN 5 END,
  CASE (sb.id % 5) WHEN 0 THEN 4 WHEN 1 THEN 4 WHEN 2 THEN 5 WHEN 3 THEN 3 WHEN 4 THEN 4 END,
  CASE (sb.id % 5) WHEN 0 THEN 3 WHEN 1 THEN 5 WHEN 2 THEN 3 WHEN 3 THEN 5 WHEN 4 THEN 5 END,
  CASE (sb.id % 5) WHEN 0 THEN 5 WHEN 1 THEN 4 WHEN 2 THEN 5 WHEN 3 THEN 4 WHEN 4 THEN 3 END,
  CASE (sb.id % 11)
    WHEN 0 THEN '발표 내용이 인상적이었습니다'
    WHEN 1 THEN '좋은 아이디어입니다. 실현 가능성이 높아 보여요'
    WHEN 2 THEN '창의적인 접근이 돋보였습니다'
    WHEN 3 THEN '실용적이고 현실적인 제안이었습니다'
    WHEN 4 THEN '글로벌 시장에서의 경쟁력이 기대됩니다'
    WHEN 5 THEN '혁신적인 비즈니스 모델이 인상적입니다'
    WHEN 6 THEN '디지털 전환 전략이 명확했습니다'
    WHEN 7 THEN '고객 가치 중심의 좋은 발표였습니다'
    WHEN 8 THEN '차별화된 강점이 잘 드러났습니다'
    WHEN 9 THEN '지속 가능한 성장 전략이 좋았습니다'
    WHEN 10 THEN '팀워크와 실행력이 돋보였습니다'
  END
FROM users u
CROSS JOIN stock_booths sb
WHERE u.unique_code IN ('U001','U005','U008','U009','U010','U011')
AND sb.name != 'CJ인재원'
AND sb.display_order <= 11;

-- ──────────────────────────────────────────────
-- stock_comments: 인재원 4명 + 김기범/정민창 × 다른 부스 4개 = 24건 (디벨롭 아이디어)
-- ──────────────────────────────────────────────
INSERT INTO stock_comments (user_id, stock_booth_id, content)
SELECT u.id, sb.id,
  CASE
    WHEN u.unique_code = 'U001' AND sb.display_order = 1 THEN '식품 사업에 IT 기술을 접목한 스마트 팩토리 구축을 제안합니다'
    WHEN u.unique_code = 'U001' AND sb.display_order = 3 THEN '물류 데이터 분석 플랫폼을 통한 배송 최적화가 필요합니다'
    WHEN u.unique_code = 'U001' AND sb.display_order = 5 THEN 'AI 기반 콘텐츠 추천 엔진 고도화를 제안합니다'
    WHEN u.unique_code = 'U001' AND sb.display_order = 7 THEN '옴니채널 고객 데이터 통합 플랫폼을 구축하면 좋겠습니다'
    WHEN u.unique_code = 'U005' AND sb.display_order = 1 THEN '식품 콜드체인 물류 혁신으로 신선도 관리를 강화해야 합니다'
    WHEN u.unique_code = 'U005' AND sb.display_order = 3 THEN '도심 물류 허브 네트워크 확장으로 당일배송 커버리지를 넓혀야 합니다'
    WHEN u.unique_code = 'U005' AND sb.display_order = 5 THEN '물류와 콘텐츠 콜라보 굿즈 배송 서비스를 제안합니다'
    WHEN u.unique_code = 'U005' AND sb.display_order = 7 THEN '뷰티 제품 특화 물류 솔루션 개발이 필요합니다'
    WHEN u.unique_code = 'U008' AND sb.display_order = 1 THEN '식품 분야에서 AI를 활용한 맞춤형 레시피 추천 서비스를 개발하면 좋겠습니다'
    WHEN u.unique_code = 'U008' AND sb.display_order = 3 THEN '물류 라스트마일 배송에 자율주행 로봇을 도입하는 것은 어떨까요'
    WHEN u.unique_code = 'U008' AND sb.display_order = 5 THEN '콘텐츠 IP를 활용한 메타버스 팬 커뮤니티 플랫폼을 제안합니다'
    WHEN u.unique_code = 'U008' AND sb.display_order = 7 THEN 'K-뷰티 구독 서비스로 해외 고객 확보 전략을 추천합니다'
    WHEN u.unique_code = 'U009' AND sb.display_order = 1 THEN '바이오 소재를 활용한 친환경 포장재 개발이 시급합니다'
    WHEN u.unique_code = 'U009' AND sb.display_order = 3 THEN '드론 배송 시범 서비스를 도심 지역에서 시작해보면 좋겠습니다'
    WHEN u.unique_code = 'U009' AND sb.display_order = 5 THEN '숏폼 콘텐츠 크리에이터 양성 프로그램을 확대하면 좋겠습니다'
    WHEN u.unique_code = 'U009' AND sb.display_order = 7 THEN '피부 진단 AI 기반 맞춤형 화장품 추천 서비스를 제안합니다'
    WHEN u.unique_code = 'U010' AND sb.display_order = 1 THEN '건강기능식품과 디지털 헬스케어 연계 서비스가 필요합니다'
    WHEN u.unique_code = 'U010' AND sb.display_order = 3 THEN '친환경 전기차 배송 네트워크 확대를 제안합니다'
    WHEN u.unique_code = 'U010' AND sb.display_order = 5 THEN '글로벌 OTT 플랫폼과의 전략적 파트너십을 강화해야 합니다'
    WHEN u.unique_code = 'U010' AND sb.display_order = 7 THEN '매장 내 AR 기반 가상 메이크업 체험 서비스를 도입하면 좋겠습니다'
    WHEN u.unique_code = 'U011' AND sb.display_order = 1 THEN '식물성 단백질 기반 대체식품 라인업을 확대해야 합니다'
    WHEN u.unique_code = 'U011' AND sb.display_order = 3 THEN '스마트 물류센터 자동화율을 높이는 로봇 솔루션을 제안합니다'
    WHEN u.unique_code = 'U011' AND sb.display_order = 5 THEN 'K-콘텐츠 현지화 전략으로 동남아 시장 공략이 필요합니다'
    WHEN u.unique_code = 'U011' AND sb.display_order = 7 THEN '클린뷰티 트렌드에 맞춘 자체 브랜드 육성을 제안합니다'
  END
FROM users u
CROSS JOIN stock_booths sb
WHERE u.unique_code IN ('U001','U005','U008','U009','U010','U011')
AND sb.display_order IN (1, 3, 5, 7);

-- ──────────────────────────────────────────────
-- user_missions: 인재원 4명 미션 진행도 반영 (미완료 상태)
-- dream(디벨롭 아이디어): progress=4, target=5
-- sincere(리뷰): progress=11, target=12
-- ──────────────────────────────────────────────
INSERT INTO user_missions (user_id, mission_id, progress, target, is_completed, completed_at, is_used, used_at)
SELECT u.id, 'dream', 4, 5, FALSE, NULL, FALSE, NULL
FROM users u WHERE u.unique_code IN ('U001','U005','U008','U009','U010','U011');

INSERT INTO user_missions (user_id, mission_id, progress, target, is_completed, completed_at, is_used, used_at)
SELECT u.id, 'sincere', 11, 12, FALSE, NULL, FALSE, NULL
FROM users u WHERE u.unique_code IN ('U001','U005','U008','U009','U010','U011');
