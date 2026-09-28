#!/usr/bin/env bash

set -euo pipefail

IMAGE_TAG="${1:?IMAGE_TAG is required}"

APP_DIR="/opt/outreach"
ENV_FILE="${APP_DIR}/.env.production"
HEALTHCHECK_TIMEOUT_SECONDS=180
HEALTHCHECK_INTERVAL_SECONDS=5

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
  up -d \
  --remove-orphans

echo "Production services started."

echo "========================================"
echo "Waiting for the HTTP server health check"
echo "========================================"

deadline=$((SECONDS + HEALTHCHECK_TIMEOUT_SECONDS))

while true; do
  http_container_id=$(docker compose --env-file "$ENV_FILE" ps -q http-server)

  if [ -n "$http_container_id" ]; then
    http_health=$(docker inspect \
      --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' \
      "$http_container_id")

    if [ "$http_health" = "healthy" ]; then
      echo "HTTP server is healthy."
      break
    fi

    if [ "$http_health" = "unhealthy" ]; then
      echo "ERROR: HTTP server became unhealthy. Keeping previous images for recovery."
      docker compose --env-file "$ENV_FILE" logs --tail=100 http-server || true
      exit 1
    fi
  fi

  if [ "$SECONDS" -ge "$deadline" ]; then
    echo "ERROR: HTTP server did not become healthy within ${HEALTHCHECK_TIMEOUT_SECONDS} seconds."
    docker compose --env-file "$ENV_FILE" logs --tail=100 http-server || true
    exit 1
  fi

  sleep "$HEALTHCHECK_INTERVAL_SECONDS"
done

for service in http-server worker web; do
  service_container_id=$(docker compose --env-file "$ENV_FILE" ps -q "$service")

  if [ -z "$service_container_id" ] || [ "$(docker inspect --format '{{.State.Status}}' "$service_container_id")" != "running" ]; then
    echo "ERROR: ${service} is not running. Keeping previous images for recovery."
    docker compose --env-file "$ENV_FILE" logs --tail=100 "$service" || true
    exit 1
  fi
done

echo "All production services are running."

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
echo "Cleaning images and build cache after verified deployment"
echo "========================================"

# This runs only after the new version is healthy, so failed deployments retain
# their pulled image and the previous image for recovery and investigation.
docker image prune -af
docker builder prune -af

echo "========================================"
echo "DEPLOYMENT COMPLETED SUCCESSFULLY"
echo "========================================"
echo "Version: ${IMAGE_TAG}"
