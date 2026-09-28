#!/usr/bin/env bash

set -euo pipefail

IMAGE_TAG="${1:?IMAGE_TAG is required}"

cd /opt/outreach

echo "======================================"
echo "Deploying version: ${IMAGE_TAG}"
echo "======================================"

ECR_REGISTRY=$(grep '^ECR_REGISTRY=' .env.production | cut -d= -f2-)

if [ -z "$ECR_REGISTRY" ]; then
  echo "ERROR: ECR_REGISTRY is missing from .env.production"
  exit 1
fi

export IMAGE_TAG

echo "Logging into ECR..."

aws ecr get-login-password \
  --region eu-north-1 \
  | docker login \
    --username AWS \
    --password-stdin \
    "$ECR_REGISTRY"


echo "Pulling images..."

docker compose \
  --env-file .env.production \
  pull


echo "Running database migrations..."

docker compose \
  --env-file .env.production \
  --profile migration \
  run --rm migration


echo "Starting services..."

docker compose \
  --env-file .env.production \
  up -d


echo "Waiting for services..."

sleep 10


echo "Current services:"

docker compose \
  --env-file .env.production \
  ps


echo "Cleaning unused Docker images..."

docker image prune -af


echo "======================================"
echo "Deployment completed successfully."
echo "======================================"