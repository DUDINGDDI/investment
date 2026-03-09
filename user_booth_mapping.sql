-- 사용자별 소속 stock_booth 매핑 (belonging_stock_booth_id UPDATE)
-- booth_uuid로 stock_booth를 참조하여 UPDATE

-- ========================================
-- 1. 올리브영 - SWIPICK (sb-oly-0001)
-- ========================================
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0001') WHERE unique_code = '838465'; -- 김나영
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0001') WHERE unique_code = '838489'; -- 김다은
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0001') WHERE unique_code = '838482'; -- 김지원
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0001') WHERE unique_code = '838430'; -- 김현진
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0001') WHERE unique_code = '838462'; -- 남은탁
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0001') WHERE unique_code = '838485'; -- 문승혜
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0001') WHERE unique_code = '838521'; -- 브엉후엔
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0001') WHERE unique_code = '838436'; -- 신동준
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0001') WHERE unique_code = '838495'; -- 이민정
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0001') WHERE unique_code = '838523'; -- 전동재

-- ========================================
-- 1. 올리브영 - THE GIANT OLIVE (sb-oly-0002)
-- ========================================
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0002') WHERE unique_code = '838469'; -- 김나윤
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0002') WHERE unique_code = '838483'; -- 김민채
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0002') WHERE unique_code = '838478'; -- 김상윤
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0002') WHERE unique_code = '838454'; -- 김주영
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0002') WHERE unique_code = '838524'; -- 도김치
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0002') WHERE unique_code = '838457'; -- 손다운
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0002') WHERE unique_code = '838491'; -- 이서연
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0002') WHERE unique_code = '838480'; -- 장송희
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0002') WHERE unique_code = '838494'; -- 최민영

-- ========================================
-- 1. 올리브영 - WAZAK! : 와작 (sb-oly-0003)
-- ========================================
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0003') WHERE unique_code = '838437'; -- 강승연
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0003') WHERE unique_code = '838459'; -- 강희진
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0003') WHERE unique_code = '838455'; -- 김다희
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0003') WHERE unique_code = '838432'; -- 김민정
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0003') WHERE unique_code = '838471'; -- 김세현
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0003') WHERE unique_code = '838451'; -- 김희연
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0003') WHERE unique_code = '838463'; -- 오지민
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0003') WHERE unique_code = '838474'; -- 이윤재
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0003') WHERE unique_code = '838522'; -- 이케다나나
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0003') WHERE unique_code = '838442'; -- 홍세림

-- ========================================
-- 1. 올리브영 - OLLYU: 올리유 (sb-oly-0004)
-- ========================================
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0004') WHERE unique_code = '838472'; -- 강기연
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0004') WHERE unique_code = '838447'; -- 강유진
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0004') WHERE unique_code = '838490'; -- 김근아
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0004') WHERE unique_code = '838429'; -- 오은솔
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0004') WHERE unique_code = '838443'; -- 유상화
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0004') WHERE unique_code = '838492'; -- 이지민
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0004') WHERE unique_code = '838453'; -- 임주희
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0004') WHERE unique_code = '838488'; -- 표세빈
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0004') WHERE unique_code = '838428'; -- 황서인
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0004') WHERE unique_code = '838481'; -- 황현정

-- ========================================
-- 1. 올리브영 - Cap In App : 캐비넷 (sb-oly-0005)
-- ========================================
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0005') WHERE unique_code = '838460'; -- 강어진
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0005') WHERE unique_code = '838444'; -- 고유진
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0005') WHERE unique_code = '838441'; -- 김민서
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0005') WHERE unique_code = '838452'; -- 김혜은
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0005') WHERE unique_code = '838439'; -- 박서린
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0005') WHERE unique_code = '838479'; -- 박성춘
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0005') WHERE unique_code = '838470'; -- 이예림
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0005') WHERE unique_code = '838476'; -- 이현지
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0005') WHERE unique_code = '838487'; -- 정지현
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0005') WHERE unique_code = '838475'; -- 최윤서

-- ========================================
-- 1. 올리브영 - ALL WAY (sb-oly-0006)
-- ========================================
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0006') WHERE unique_code = '838464'; -- 김경화
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0006') WHERE unique_code = '838458'; -- 박소현
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0006') WHERE unique_code = '838446'; -- 엄유리
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0006') WHERE unique_code = '838484'; -- 유소연
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0006') WHERE unique_code = '838473'; -- 이수민
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0006') WHERE unique_code = '838434'; -- 이승주
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0006') WHERE unique_code = '838477'; -- 허정원
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0006') WHERE unique_code = '838496'; -- 홍윤지
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0006') WHERE unique_code = '838445'; -- 황수진

-- ========================================
-- 1. 올리브영 - 베러링 (sb-oly-0007)
-- ========================================
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0007') WHERE unique_code = '838449'; -- 고정미
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0007') WHERE unique_code = '838486'; -- 김규리
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0007') WHERE unique_code = '838431'; -- 김다윤
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0007') WHERE unique_code = '838440'; -- 박조은
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0007') WHERE unique_code = '838433'; -- 박효진
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0007') WHERE unique_code = '838467'; -- 송현우
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0007') WHERE unique_code = '838435'; -- 신혜인
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0007') WHERE unique_code = '838448'; -- 이은주
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0007') WHERE unique_code = '838461'; -- 최유정
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-oly-0007') WHERE unique_code = '838450'; -- 최윤서

-- ========================================
-- 2. CJ ENM - 엠플메이트 (sb-enm-0001)
-- ========================================
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-enm-0001') WHERE unique_code = 'D100337'; -- 김지혜
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-enm-0001') WHERE unique_code = 'T100515'; -- 변희주
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-enm-0001') WHERE unique_code = 'T100516'; -- 이다현
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-enm-0001') WHERE unique_code = '13569'; -- 이시은
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-enm-0001') WHERE unique_code = '13567'; -- 이주현
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-enm-0001') WHERE unique_code = '13571'; -- 한아름

-- ========================================
-- 2. CJ ENM - 아 그그그 뭐였더라? (sb-enm-0002)
-- ========================================
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-enm-0002') WHERE unique_code = '13561'; -- 김수
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-enm-0002') WHERE unique_code = '13559'; -- 위다현
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-enm-0002') WHERE unique_code = 'T100517'; -- 윤진노
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-enm-0002') WHERE unique_code = '13568'; -- 이나영
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-enm-0002') WHERE unique_code = '13560'; -- 최다연
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-enm-0002') WHERE unique_code = '13558'; -- 카와하라사쿠라

-- ========================================
-- 2. CJ ENM - 찜질방 (sb-enm-0003)
-- ========================================
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-enm-0003') WHERE unique_code = '13562'; -- 김가영
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-enm-0003') WHERE unique_code = 'T100514'; -- 김도연
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-enm-0003') WHERE unique_code = '13563'; -- 이건하
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-enm-0003') WHERE unique_code = '13566'; -- 최정인
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-enm-0003') WHERE unique_code = 'D100336'; -- 황혜욱

-- ========================================
-- 2. CJ ENM - 리얼레이서 (sb-enm-0004)
-- ========================================
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-enm-0004') WHERE unique_code = '13573'; -- 김서현
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-enm-0004') WHERE unique_code = '13572'; -- 박소언
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-enm-0004') WHERE unique_code = 'T100513'; -- 박소영
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-enm-0004') WHERE unique_code = '13564'; -- 박지현
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-enm-0004') WHERE unique_code = '13574'; -- 임세원
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-enm-0004') WHERE unique_code = '13570'; -- 한재환

-- ========================================
-- 3. 대한통운 건설부문 - ALI-GO (sb-con-0001)
-- ========================================
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-con-0001') WHERE unique_code = '13414736'; -- 김경민
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-con-0001') WHERE unique_code = '13414744'; -- 김영주
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-con-0001') WHERE unique_code = '13414746'; -- 박성진
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-con-0001') WHERE unique_code = '13414748'; -- 박인영
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-con-0001') WHERE unique_code = '13414749'; -- 안훈희
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-con-0001') WHERE unique_code = '13414739'; -- 조형탁
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-con-0001') WHERE unique_code = '13414753'; -- 최현우

-- ========================================
-- 3. 대한통운 건설부문 - PROTRACK (sb-con-0002)
-- ========================================
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-con-0002') WHERE unique_code = '13414737'; -- 권혁균
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-con-0002') WHERE unique_code = '13414740'; -- 김민석
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-con-0002') WHERE unique_code = '13414743'; -- 김지원
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-con-0002') WHERE unique_code = '13414741'; -- 박태인
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-con-0002') WHERE unique_code = '13414751'; -- 신보연
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-con-0002') WHERE unique_code = '13414754'; -- 이원종

-- ========================================
-- 3. 대한통운 건설부문 - HEAT-DECK (sb-con-0003)
-- ========================================
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-con-0003') WHERE unique_code = '13414750'; -- 김경천
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-con-0003') WHERE unique_code = '13414747'; -- 김태형
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-con-0003') WHERE unique_code = '13414745'; -- 신범호
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-con-0003') WHERE unique_code = '13414735'; -- 이지연
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-con-0003') WHERE unique_code = '13414752'; -- 이한성
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-con-0003') WHERE unique_code = '13414738'; -- 홍성민
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-con-0003') WHERE unique_code = '13414742'; -- 홍인표

-- ========================================
-- 4. 올리브네트웍스 - TwInsight (sb-onw-0001)
-- ========================================
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-onw-0001') WHERE unique_code = '836133'; -- 권지윤
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-onw-0001') WHERE unique_code = '836125'; -- 박도훈
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-onw-0001') WHERE unique_code = '836122'; -- 오준혁
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-onw-0001') WHERE unique_code = '836128'; -- 유지희
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-onw-0001') WHERE unique_code = '836127'; -- 이유찬

-- ========================================
-- 4. 올리브네트웍스 - BO'DA (sb-onw-0002)
-- ========================================
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-onw-0002') WHERE unique_code = '836121'; -- 고경태
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-onw-0002') WHERE unique_code = '836131'; -- 김경이
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-onw-0002') WHERE unique_code = '836119'; -- 박재성
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-onw-0002') WHERE unique_code = '836116'; -- 이나연
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-onw-0002') WHERE unique_code = '836132'; -- 이연진
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-onw-0002') WHERE unique_code = '836117'; -- 정민경

-- ========================================
-- 4. 올리브네트웍스 - Gotcha (sb-onw-0003)
-- ========================================
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-onw-0003') WHERE unique_code = '836129'; -- 노형준
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-onw-0003') WHERE unique_code = '836124'; -- 박이내
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-onw-0003') WHERE unique_code = '836123'; -- 안현주
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-onw-0003') WHERE unique_code = '836126'; -- 유가람
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-onw-0003') WHERE unique_code = '836130'; -- 이근탁

-- ========================================
-- 5. ENM 커머스 - 온스탁 (sb-com-0001)
-- ========================================
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-com-0001') WHERE unique_code = '13546'; -- 김미래
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-com-0001') WHERE unique_code = '13549'; -- 김유정
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-com-0001') WHERE unique_code = '13547'; -- 김예빈
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-com-0001') WHERE unique_code = '13545'; -- 최예현

-- ========================================
-- 5. ENM 커머스 - ON-FLIGHT (sb-com-0002)
-- ========================================
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-com-0002') WHERE unique_code = '13542'; -- 김윤아
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-com-0002') WHERE unique_code = '13541'; -- 박유진
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-com-0002') WHERE unique_code = '13548'; -- 민규리
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-com-0002') WHERE unique_code = '13543'; -- 민지원
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-com-0002') WHERE unique_code = '13544'; -- 황병휘

-- ========================================
-- 6. 프레시웨이 - GO:ON (sb-frw-0001)
-- ========================================
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0001') WHERE unique_code = '263563'; -- 김다진
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0001') WHERE unique_code = '263551'; -- 박상윤
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0001') WHERE unique_code = '263582'; -- 박희선
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0001') WHERE unique_code = '263598'; -- 변혜교
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0001') WHERE unique_code = '263560'; -- 오윤서
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0001') WHERE unique_code = '263555'; -- 이은찬
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0001') WHERE unique_code = '263558'; -- 한현구

-- ========================================
-- 6. 프레시웨이 - K-Village (sb-frw-0002)
-- ========================================
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0002') WHERE unique_code = '263579'; -- 김민주
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0002') WHERE unique_code = '263572'; -- 김유진
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0002') WHERE unique_code = '263599'; -- 김종안
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0002') WHERE unique_code = '263575'; -- 박주희
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0002') WHERE unique_code = '263597'; -- 우하진
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0002') WHERE unique_code = '263547'; -- 이무연
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0002') WHERE unique_code = '263603'; -- 최인영

-- ========================================
-- 6. 프레시웨이 - 카페IN봄 (sb-frw-0003)
-- ========================================
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0003') WHERE unique_code = '263548'; -- 김대안
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0003') WHERE unique_code = '263576'; -- 김민채
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0003') WHERE unique_code = '263550'; -- 배현우
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0003') WHERE unique_code = '263591'; -- 윤나경
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0003') WHERE unique_code = '263554'; -- 이상윤
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0003') WHERE unique_code = '263562'; -- 한나연
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0003') WHERE unique_code = '263570'; -- 한동호

-- ========================================
-- 6. 프레시웨이 - 아코디온;溫 (sb-frw-0004)
-- ========================================
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0004') WHERE unique_code = '263596'; -- 강보영
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0004') WHERE unique_code = '263569'; -- 박무송
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0004') WHERE unique_code = '263584'; -- 박홍범
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0004') WHERE unique_code = '263580'; -- 정승민
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0004') WHERE unique_code = '263577'; -- 최민수
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0004') WHERE unique_code = '263601'; -- 최정원
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0004') WHERE unique_code = '263568'; -- 황유경

-- ========================================
-- 6. 프레시웨이 - 오이배송 (sb-frw-0005)
-- ========================================
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0005') WHERE unique_code = '263602'; -- 김지상
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0005') WHERE unique_code = '263573'; -- 김혜리
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0005') WHERE unique_code = '263571'; -- 박찬혜
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0005') WHERE unique_code = '263594'; -- 윤성준
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0005') WHERE unique_code = '263595'; -- 이유연
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0005') WHERE unique_code = '263586'; -- 임정은
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0005') WHERE unique_code = '263545'; -- 허민정

-- ========================================
-- 6. 프레시웨이 - TOK TALK (sb-frw-0006)
-- ========================================
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0006') WHERE unique_code = '263565'; -- 강원중
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0006') WHERE unique_code = '263578'; -- 김주현
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0006') WHERE unique_code = '263556'; -- 김지홍
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0006') WHERE unique_code = '263561'; -- 박시윤
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0006') WHERE unique_code = '263585'; -- 서채현
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0006') WHERE unique_code = '263549'; -- 이정민
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0006') WHERE unique_code = '263588'; -- 이지원

-- ========================================
-- 6. 프레시웨이 - 픽플(pick+) (sb-frw-0007)
-- ========================================
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0007') WHERE unique_code = '263581'; -- 김예린
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0007') WHERE unique_code = '263566'; -- 김지수
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0007') WHERE unique_code = '263593'; -- 서민정
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0007') WHERE unique_code = '263592'; -- 서유진
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0007') WHERE unique_code = '263546'; -- 이은지
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0007') WHERE unique_code = '263564'; -- 이준영
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0007') WHERE unique_code = '263590'; -- 장길평
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0007') WHERE unique_code = '263589'; -- 조윤서

-- ========================================
-- 6. 프레시웨이 - 아이누리터 (sb-frw-0008)
-- ========================================
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0008') WHERE unique_code = '263553'; -- 김욱종
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0008') WHERE unique_code = '263559'; -- 김지원
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0008') WHERE unique_code = '263587'; -- 손유진
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0008') WHERE unique_code = '263583'; -- 안수현
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0008') WHERE unique_code = '263600'; -- 윤형준
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0008') WHERE unique_code = '263557'; -- 이유리
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0008') WHERE unique_code = '263552'; -- 이은지
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-frw-0008') WHERE unique_code = '263567'; -- 최찬혁

-- ========================================
-- 7. CGV/4DPLEX - CGV POPSDAQ (sb-cgv-0001)
-- ========================================
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cgv-0001') WHERE unique_code = '200928'; -- 김나연
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cgv-0001') WHERE unique_code = '100921'; -- 김민주B
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cgv-0001') WHERE unique_code = '100922'; -- 김세영
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cgv-0001') WHERE unique_code = '200926'; -- 설다연
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cgv-0001') WHERE unique_code = '200927'; -- 유승민
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cgv-0001') WHERE unique_code = '100924'; -- 이지연

-- ========================================
-- 7. CGV/4DPLEX - IMMERSIUM (sb-cgv-0002)
-- ========================================
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cgv-0002') WHERE unique_code = '100920'; -- 김민주A
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cgv-0002') WHERE unique_code = '200930'; -- 김선혁
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cgv-0002') WHERE unique_code = '100923'; -- 여송원
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cgv-0002') WHERE unique_code = '200925'; -- 전우진
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cgv-0002') WHERE unique_code = '100925'; -- 정해원
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cgv-0002') WHERE unique_code = '200929'; -- 정혜진

-- ========================================
-- 8. 제일제당 - GACHI SAUCE (sb-cjd-0001)
-- ========================================
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0001') WHERE unique_code = '315811'; -- 강호영
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0001') WHERE unique_code = '315817'; -- 고화정
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0001') WHERE unique_code = '315821'; -- 민예지
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0001') WHERE unique_code = '315850'; -- 박은총
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0001') WHERE unique_code = '315833'; -- 신세아
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0001') WHERE unique_code = '315798'; -- 이수민
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0001') WHERE unique_code = '315804'; -- 진희정

-- ========================================
-- 8. 제일제당 - Dip-Pokki (sb-cjd-0002)
-- ========================================
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0002') WHERE unique_code = '315836'; -- 김우림
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0002') WHERE unique_code = '315806'; -- 김정연
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0002') WHERE unique_code = '315831'; -- 김혜빈
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0002') WHERE unique_code = '315835'; -- 박준서
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0002') WHERE unique_code = '315799'; -- 이기혁
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0002') WHERE unique_code = '315818'; -- 이용임
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0002') WHERE unique_code = '315802'; -- 이하은
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0002') WHERE unique_code = '315829'; -- 천민주

-- ========================================
-- 8. 제일제당 - 비빔선생 (sb-cjd-0003)
-- ========================================
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0003') WHERE unique_code = '315808'; -- 김가은
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0003') WHERE unique_code = '315794'; -- 김려원
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0003') WHERE unique_code = '315834'; -- 임연수
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0003') WHERE unique_code = '315830'; -- 정민우
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0003') WHERE unique_code = '315800'; -- 정소희
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0003') WHERE unique_code = '315814'; -- 정유선
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0003') WHERE unique_code = '315820'; -- 허의정

-- ========================================
-- 8. 제일제당 - ONDA Spread (sb-cjd-0004)
-- ========================================
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0004') WHERE unique_code = '315824'; -- 박지원
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0004') WHERE unique_code = '315815'; -- 서윤지
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0004') WHERE unique_code = '315816'; -- 손호영
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0004') WHERE unique_code = '315839'; -- 오세영
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0004') WHERE unique_code = '315858'; -- 이수진
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0004') WHERE unique_code = '315805'; -- 이새봄
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0004') WHERE unique_code = '315801'; -- 장재훈

-- ========================================
-- 8. 제일제당 - 칰칰칩 (sb-cjd-0005)
-- ========================================
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0005') WHERE unique_code = '315823'; -- 김성아
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0005') WHERE unique_code = '315812'; -- 김종휘
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0005') WHERE unique_code = '315810'; -- 안세인
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0005') WHERE unique_code = '315828'; -- 유송희
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0005') WHERE unique_code = '315813'; -- 유혜수
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0005') WHERE unique_code = '315826'; -- 이보경
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0005') WHERE unique_code = '315841'; -- 정진수
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0005') WHERE unique_code = '315807'; -- 최민영

-- ========================================
-- 8. 제일제당 - AmiNoLoss (sb-cjd-0006)
-- ========================================
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0006') WHERE unique_code = '315778'; -- 강인
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0006') WHERE unique_code = '315803'; -- 김시온
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0006') WHERE unique_code = '315785'; -- 김시현
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0006') WHERE unique_code = '315781'; -- 신동민
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0006') WHERE unique_code = '315779'; -- 임은민
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0006') WHERE unique_code = '315784'; -- 장서인
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0006') WHERE unique_code = '315825'; -- 최지민

-- ========================================
-- 8. 제일제당 - PHABY (sb-cjd-0007)
-- ========================================
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0007') WHERE unique_code = '315777'; -- 김유림
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0007') WHERE unique_code = '315782'; -- 김윤재
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0007') WHERE unique_code = '315786'; -- 김혜린
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0007') WHERE unique_code = '315809'; -- 서수림
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0007') WHERE unique_code = '315783'; -- 유주희
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0007') WHERE unique_code = '315780'; -- 이승철
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0007') WHERE unique_code = '315832'; -- 정민제
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-cjd-0007') WHERE unique_code = '315822'; -- 최가은

-- ========================================
-- 9. 대한통운 - ANY O-NE (sb-dht-0001)
-- ========================================
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-dht-0001') WHERE unique_code = '13414715'; -- 김민재
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-dht-0001') WHERE unique_code = '13414722'; -- 심병규
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-dht-0001') WHERE unique_code = '13414717'; -- 유민주
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-dht-0001') WHERE unique_code = '13414730'; -- 윤현정
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-dht-0001') WHERE unique_code = '13414716'; -- 이정훈
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-dht-0001') WHERE unique_code = '13414705'; -- 최태규

-- ========================================
-- 9. 대한통운 - THE A-PRO [더 앞으로] (sb-dht-0002)
-- ========================================
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-dht-0002') WHERE unique_code = '13414726'; -- 김희진
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-dht-0002') WHERE unique_code = '13414721'; -- 손유정
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-dht-0002') WHERE unique_code = '13414706'; -- 홍창언
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-dht-0002') WHERE unique_code = '13414723'; -- 황은유
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-dht-0002') WHERE unique_code = '13414710'; -- 황준화

-- ========================================
-- 9. 대한통운 - ONE-AIR [오네어] (sb-dht-0003)
-- ========================================
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-dht-0003') WHERE unique_code = '13414728'; -- 도유영
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-dht-0003') WHERE unique_code = '13414711'; -- 박연진
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-dht-0003') WHERE unique_code = '13414704'; -- 배정윤
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-dht-0003') WHERE unique_code = '13414713'; -- 배호진
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-dht-0003') WHERE unique_code = '13414719'; -- 이정범
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-dht-0003') WHERE unique_code = '13414708'; -- 정유빈

-- ========================================
-- 9. 대한통운 - RE-WORK (sb-dht-0004)
-- ========================================
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-dht-0004') WHERE unique_code = '13414712'; -- 나현지
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-dht-0004') WHERE unique_code = '13414714'; -- 박석훈
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-dht-0004') WHERE unique_code = '13414720'; -- 소지원
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-dht-0004') WHERE unique_code = '13414718'; -- 유영민
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-dht-0004') WHERE unique_code = '13414707'; -- 이승우
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-dht-0004') WHERE unique_code = '13414724'; -- 진태광

-- ========================================
-- 10. 푸드빌 - CAKE-OUT (sb-fvl-0001)
-- ========================================
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-fvl-0001') WHERE unique_code = '204705'; -- 김민찬
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-fvl-0001') WHERE unique_code = '204707'; -- 김현준
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-fvl-0001') WHERE unique_code = '204712'; -- 서온비
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-fvl-0001') WHERE unique_code = '204714'; -- 윤가영
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-fvl-0001') WHERE unique_code = '204715'; -- 윤종화
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-fvl-0001') WHERE unique_code = '204720'; -- 정예림

-- ========================================
-- 10. 푸드빌 - TelL : J (sb-fvl-0002)
-- ========================================
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-fvl-0002') WHERE unique_code = '204706'; -- 김동연
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-fvl-0002') WHERE unique_code = '204708'; -- 김혜인
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-fvl-0002') WHERE unique_code = '204709'; -- 문소영
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-fvl-0002') WHERE unique_code = '204717'; -- 이승빈
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-fvl-0002') WHERE unique_code = '204718'; -- 이어진
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-fvl-0002') WHERE unique_code = '204719'; -- 전혜진

-- ========================================
-- 10. 푸드빌 - VIPS : PACE (sb-fvl-0003)
-- ========================================
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-fvl-0003') WHERE unique_code = '204721'; -- 김경희
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-fvl-0003') WHERE unique_code = '204722'; -- 박가은
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-fvl-0003') WHERE unique_code = '204710'; -- 박소연
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-fvl-0003') WHERE unique_code = '204711'; -- 배하은
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-fvl-0003') WHERE unique_code = '204716'; -- 이수환
UPDATE users SET belonging_stock_booth_id = (SELECT id FROM stock_booths WHERE booth_uuid = 'sb-fvl-0003') WHERE unique_code = '204723'; -- 정세비
