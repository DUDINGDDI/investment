#!/bin/bash
# SSL 초기 설정 스크립트
# 1) 임시 자체서명 인증서 생성 → Nginx 시작 가능
# 2) Let's Encrypt 실제 인증서 발급
# 3) Nginx 재시작

set -e

DOMAIN="onlyone-fair.net"
EMAIL="anstjsdn3124@gmail.com"

echo "=== 1단계: 임시 자체서명 인증서 생성 ==="
mkdir -p certbot/conf/live/$DOMAIN
openssl req -x509 -nodes -days 1 -newkey rsa:2048 \
  -keyout certbot/conf/live/$DOMAIN/privkey.pem \
  -out certbot/conf/live/$DOMAIN/fullchain.pem \
  -subj "/CN=$DOMAIN" 2>/dev/null
echo "임시 인증서 생성 완료"

echo ""
echo "=== 2단계: Docker Compose 시작 ==="
docker compose -f docker-compose.prod.yml up -d --build
echo "서비스 시작 대기 중..."
sleep 10

echo ""
echo "=== 3단계: Let's Encrypt 실제 인증서 발급 ==="
# 임시 인증서 삭제
rm -rf certbot/conf/live/$DOMAIN
rm -rf certbot/conf/archive/$DOMAIN
rm -rf certbot/conf/renewal/$DOMAIN.conf

# 실제 인증서 발급
docker compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d $DOMAIN \
  --agree-tos --email $EMAIL \
  --non-interactive

echo ""
echo "=== 4단계: Nginx 재시작 (실제 인증서 적용) ==="
docker compose -f docker-compose.prod.yml exec frontend nginx -s reload

echo ""
echo "=========================================="
echo " SSL 설정 완료!"
echo " https://$DOMAIN 으로 접속하세요"
echo "=========================================="
