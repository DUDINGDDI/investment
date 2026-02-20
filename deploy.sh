#!/bin/bash
# ============================================
# 부스 투자 시뮬레이터 - AWS EC2 배포 스크립트
# Ubuntu 22.04 / 24.04 전용
# ============================================
# 사용법: 아래 변수를 수정한 뒤 실행
#   chmod +x deploy.sh && sudo ./deploy.sh
# ============================================

set -e

# ── 설정 변수 (필요 시 수정) ──
GIT_REPO="https://github.com/YOUR_USERNAME/YOUR_REPO.git"  # ← 본인 Git 주소로 변경
DB_NAME="booth_invest"
DB_USER="booth_user"
DB_PASS="booth1234"
DB_ROOT_PASS="root1234"
APP_DIR="/opt/investment"
DOMAIN="_"  # 도메인이 있으면 변경 (예: invest.example.com)

echo "=========================================="
echo " 1단계: 시스템 패키지 업데이트"
echo "=========================================="
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl wget unzip fontconfig

echo "=========================================="
echo " 2단계: Java 21 설치"
echo "=========================================="
sudo apt install -y openjdk-21-jdk
java -version

echo "=========================================="
echo " 3단계: Node.js 20 설치"
echo "=========================================="
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v && npm -v

echo "=========================================="
echo " 4단계: MySQL 8.0 설치"
echo "=========================================="
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql

echo "=========================================="
echo " 5단계: MySQL DB + 유저 생성"
echo "=========================================="
sudo mysql <<MYSQL_SCRIPT
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${DB_ROOT_PASS}';
CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
MYSQL_SCRIPT
echo "MySQL DB/유저 생성 완료"

echo "=========================================="
echo " 6단계: Git 클론"
echo "=========================================="
sudo rm -rf ${APP_DIR}
sudo mkdir -p ${APP_DIR}
sudo git clone ${GIT_REPO} ${APP_DIR}
cd ${APP_DIR}

echo "=========================================="
echo " 7단계: MySQL 스키마 + 시드 데이터 적용"
echo "=========================================="
mysql -u ${DB_USER} -p${DB_PASS} ${DB_NAME} < ${APP_DIR}/db/init/01_schema.sql
mysql -u ${DB_USER} -p${DB_PASS} ${DB_NAME} < ${APP_DIR}/db/init/02_seed_data.sql
echo "스키마 + 시드 데이터 적용 완료"

echo "=========================================="
echo " 8단계: Spring Boot 백엔드 빌드"
echo "=========================================="
cd ${APP_DIR}
chmod +x ./gradlew
./gradlew build -x test
echo "백엔드 빌드 완료"

echo "=========================================="
echo " 9단계: 프론트엔드 빌드"
echo "=========================================="
cd ${APP_DIR}/frontend
npm install
npm run build
echo "프론트엔드 빌드 완료"

echo "=========================================="
echo " 10단계: Nginx 설치 및 설정"
echo "=========================================="
sudo apt install -y nginx

# 프론트엔드 빌드 파일 복사
sudo rm -rf /var/www/investment
sudo mkdir -p /var/www/investment
sudo cp -r ${APP_DIR}/frontend/dist/* /var/www/investment/

# Nginx 설정
sudo tee /etc/nginx/sites-available/investment > /dev/null <<NGINX_CONF
server {
    listen 80;
    server_name ${DOMAIN};

    # 프론트엔드 (React SPA)
    root /var/www/investment;
    index index.html;

    # API 요청 → Spring Boot로 프록시
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # SPA 라우팅 (React Router)
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # 정적 파일 캐시
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINX_CONF

# sites-enabled에 심볼릭 링크 생성 + default 제거
sudo ln -sf /etc/nginx/sites-available/investment /etc/nginx/sites-enabled/investment
sudo rm -f /etc/nginx/sites-enabled/default

sudo nginx -t && sudo systemctl restart nginx
sudo systemctl enable nginx
echo "Nginx 설정 완료"

echo "=========================================="
echo " 11단계: Spring Boot를 systemd 서비스로 등록"
echo "=========================================="
sudo tee /etc/systemd/system/investment.service > /dev/null <<SERVICE
[Unit]
Description=Booth Investment Simulator Backend
After=network.target mysql.service

[Service]
Type=simple
User=root
WorkingDirectory=${APP_DIR}
ExecStart=/usr/bin/java -jar ${APP_DIR}/build/libs/investment-0.0.1-SNAPSHOT.jar --spring.profiles.active=mysql
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
SERVICE

sudo systemctl daemon-reload
sudo systemctl start investment
sudo systemctl enable investment
echo "백엔드 서비스 시작 완료"

echo "=========================================="
echo " 12단계: 방화벽 설정"
echo "=========================================="
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw --force enable

echo ""
echo "=========================================="
echo " 배포 완료!"
echo "=========================================="
echo ""
echo " 접속 주소: http://$(curl -s ifconfig.me 2>/dev/null || echo '<서버IP>')"
echo " 관리자:    http://$(curl -s ifconfig.me 2>/dev/null || echo '<서버IP>')/admin"
echo ""
echo " 유용한 명령어:"
echo "   백엔드 로그:    sudo journalctl -u investment -f"
echo "   백엔드 재시작:  sudo systemctl restart investment"
echo "   Nginx 재시작:   sudo systemctl restart nginx"
echo "   MySQL 접속:     mysql -u ${DB_USER} -p${DB_PASS} ${DB_NAME}"
echo "=========================================="
