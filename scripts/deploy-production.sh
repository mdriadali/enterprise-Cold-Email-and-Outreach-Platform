#!/usr/bin/env bash

set -euo pipefail

IMAGE_TAG="${1:?IMAGE_TAG is required}"

cd /opt/outreach

echo "========================================"
echo "Starting Production Deployment"
echo "========================================"

echo "Image tag: ${IMAGE_TAG}"

echo ""
echo "Loading environment..."

if [ ! -f /opt/outreach/.env.production ]; then
    echo "ERROR: .env.production does not exist"
    exit 1
fi

set -a
source /opt/outreach/.env.production
set +a

export IMAGE_TAG

echo "Environment loaded"

echo ""
echo "Checking required variables..."

: "${ECR_REGISTRY:?ECR_REGISTRY is missing}"

echo "ECR Registry: ${ECR_REGISTRY}"
echo "AWS Region: ${AWS_REGION:-eu-north-1}"

echo ""
echo "========================================"
echo "Logging into Amazon ECR"
echo "========================================"

aws ecr get-login-password \
    --region "${AWS_REGION:-eu-north-1}" \
    | docker login \
        --username AWS \
        --password-stdin \
        "${ECR_REGISTRY}"

echo ""
echo "ECR login successful"

echo ""
echo "========================================"
echo "Pulling Docker Images"
echo "========================================"

docker compose \
    --env-file .env.production \
    pull

echo ""
echo "Docker images pulled successfully"

echo ""
echo "========================================"
echo "Running Database Migration"
echo "========================================"

docker compose \
    --env-file .env.production \
    --profile migration \
    run --rm migration

echo ""
echo "Database migration completed"

echo ""
echo "========================================"
echo "Starting Services"
echo "========================================"

docker compose \
    --env-file .env.production \
    up -d

echo ""
echo "Services started"

echo ""
echo "========================================"
echo "Cleaning Old Images"
echo "========================================"

docker image prune -af
#!/usr/bin/env bash

set -euo pipefail

IMAGE_TAG="${1:?IMAGE_TAG is required}"

APP_DIR="/opt/outreach"
ENV_FILE="${APP_DIR}/.env.production"

cd "$APP_DIR"

echo "========================================"
echo "Starting production deployment"
echo "========================================"
echo "IMAGE_TAG: ${IMAGE_TAG}"

if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: ${ENV_FILE} not found"
  exit 1
fi

echo "Loading production environment..."

set -a
source "$ENV_FILE"
set +a

export IMAGE_TAG

AWS_REGION="${AWS_REGION:-eu-north-1}"

if [ -z "${ECR_REGISTRY:-}" ]; then
  echo "ERROR: ECR_REGISTRY is not set"
  exit 1
fi

echo "AWS_REGION: ${AWS_REGION}"
echo "ECR_REGISTRY: ${ECR_REGISTRY}"

echo "========================================"
echo "Checking required commands"
echo "========================================"

command -v aws
command -v docker

echo "AWS version:"
aws --version

echo "Docker version:"
docker --version

echo "Docker Compose version:"
docker compose version

echo "========================================"
echo "Logging into Amazon ECR"
echo "========================================"

aws ecr get-login-password \
  --region "$AWS_REGION" \
  | docker login \
      --username AWS \
      --password-stdin \
      "$ECR_REGISTRY"

echo "ECR login successful."

echo "========================================"
echo "Pulling Docker images"
echo "========================================"

docker compose \
  --env-file "$ENV_FILE" \
  pull

echo "Docker images pulled successfully."

echo "========================================"
echo "Running database migrations"
echo "========================================"

docker compose \
  --env-file "$ENV_FILE" \
  --profile migration \
  run --rm migration

echo "Database migration completed."

echo "========================================"
echo "Starting production services"
echo "========================================"

docker compose \
  --env-file "$ENV_FILE" \
  up -d

echo "Production services started."

echo "========================================"
echo "Waiting for services"
echo "========================================"

sleep 10

echo "========================================"
echo "Current services"
echo "========================================"

docker compose \
  --env-file "$ENV_FILE" \
  ps

echo "========================================"
echo "Recent container logs"
echo "========================================"

docker compose \
  --env-file "$ENV_FILE" \
  logs --tail=50 http-server || true

echo "========================================"
echo "Cleaning old Docker images"
echo "========================================"

docker image prune -af

echo "========================================"
echo "DEPLOYMENT COMPLETED SUCCESSFULLY"
echo "========================================"
echo "Version: ${IMAGE_TAG}"
echo ""
echo "========================================"
echo "Current Services"
echo "========================================"

docker compose \
    --env-file .env.production \
    ps

echo ""
echo "========================================"
echo "Deployment Completed Successfully"
echo "========================================"