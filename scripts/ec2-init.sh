#!/bin/bash
# ============================================
# EC2 초기 설정 스크립트
# Ubuntu 22.04 / 24.04 전용
# 최초 1회만 실행
# 사용법: chmod +x scripts/ec2-init.sh && sudo ./scripts/ec2-init.sh
# ============================================

set -e

GIT_REPO="https://github.com/DUDINGDDI/investment.git"
APP_DIR="/opt/investment"

echo "=========================================="
echo " 1단계: 시스템 패키지 업데이트"
echo "=========================================="
apt update && apt upgrade -y
apt install -y git curl wget

echo "=========================================="
echo " 2단계: Docker 설치"
echo "=========================================="
apt install -y docker.io docker-compose-plugin
systemctl start docker
systemctl enable docker

echo "=========================================="
echo " 3단계: 현재 사용자를 docker 그룹에 추가"
echo "=========================================="
usermod -aG docker ${SUDO_USER:-ubuntu}

echo "=========================================="
echo " 4단계: 프로젝트 클론"
echo "=========================================="
rm -rf ${APP_DIR}
mkdir -p ${APP_DIR}
git clone ${GIT_REPO} ${APP_DIR}
cd ${APP_DIR}

echo "=========================================="
echo " 5단계: .env 파일 생성"
echo "=========================================="
if [ ! -f ${APP_DIR}/.env ]; then
  cat > ${APP_DIR}/.env <<'EOF'
# MySQL
MYSQL_ROOT_PASSWORD=root1234
MYSQL_DATABASE=booth_invest
MYSQL_USER=booth_user
MYSQL_PASSWORD=booth1234

# Spring Boot
SPRING_PROFILES_ACTIVE=mysql
SERVER_PORT=8080
EOF
  echo ".env 파일 생성 완료 — 프로덕션 비밀번호로 변경하세요!"
else
  echo ".env 파일이 이미 존재합니다. 건너뜁니다."
fi

echo "=========================================="
echo " 6단계: 방화벽 설정"
echo "=========================================="
ufw allow OpenSSH
ufw allow 80/tcp
ufw --force enable

echo "=========================================="
echo " 7단계: 서비스 시작"
echo "=========================================="
cd ${APP_DIR}
docker compose -f docker-compose.prod.yml up -d --build

echo ""
echo "=========================================="
echo " 초기 설정 완료!"
echo "=========================================="
echo ""
echo " 접속 주소: http://$(curl -s ifconfig.me 2>/dev/null || echo '<서버IP>')"
echo " 관리자:    http://$(curl -s ifconfig.me 2>/dev/null || echo '<서버IP>')/admin"
echo ""
echo " 필수 작업:"
echo "   1. .env 파일의 비밀번호를 프로덕션 값으로 변경"
echo "   2. GitHub Secrets 등록 (EC2_HOST, EC2_USERNAME, EC2_SSH_KEY, EC2_SSH_PORT)"
echo ""
echo " 유용한 명령어:"
echo "   전체 로그:      cd ${APP_DIR} && docker compose -f docker-compose.prod.yml logs -f"
echo "   백엔드 로그:    cd ${APP_DIR} && docker compose -f docker-compose.prod.yml logs -f backend"
echo "   서비스 재시작:  cd ${APP_DIR} && docker compose -f docker-compose.prod.yml restart"
echo "   서비스 중지:    cd ${APP_DIR} && docker compose -f docker-compose.prod.yml down"
echo "=========================================="
