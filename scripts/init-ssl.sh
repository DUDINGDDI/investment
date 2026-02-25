#!/bin/bash
set -e

DOMAIN="onlyonefair.duckdns.org"
DATA_PATH="./certbot"

echo "=== SSL 초기 설정: $DOMAIN ==="

# 디렉토리 생성
mkdir -p "$DATA_PATH/conf/live/$DOMAIN"
mkdir -p "$DATA_PATH/www"

# 1) Nginx가 시작할 수 있도록 임시 자체 서명 인증서 생성
echo "=== 임시 인증서 생성 ==="
openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout "$DATA_PATH/conf/live/$DOMAIN/privkey.pem" \
    -out "$DATA_PATH/conf/live/$DOMAIN/fullchain.pem" \
    -subj "/CN=$DOMAIN"

# 2) Docker Compose 시작 (임시 인증서로 Nginx 기동)
echo "=== Docker Compose 시작 ==="
docker compose -f docker-compose.prod.yml up -d
sleep 10

# 3) 임시 인증서 삭제
echo "=== 임시 인증서 삭제 ==="
rm -rf "$DATA_PATH/conf/live/$DOMAIN"
rm -rf "$DATA_PATH/conf/archive/$DOMAIN"
rm -rf "$DATA_PATH/conf/renewal/$DOMAIN.conf"

# 4) Let's Encrypt 실제 인증서 발급
echo "=== Let's Encrypt 인증서 발급 ==="
docker compose -f docker-compose.prod.yml run --rm certbot certonly \
    --webroot --webroot-path=/var/www/certbot \
    -d "$DOMAIN" \
    --agree-tos --no-eff-email \
    --register-unsafely-without-email \
    --force-renewal

# 5) Nginx 리로드
echo "=== Nginx 리로드 ==="
docker compose -f docker-compose.prod.yml exec frontend nginx -s reload

echo ""
echo "✅ SSL 설정 완료! https://$DOMAIN 으로 접속 가능합니다."
