#!/usr/bin/env bash

set -euo pipefail

IMAGE_TAG="${1:?IMAGE_TAG is required}"

cd /opt/outreach

echo "Loading production environment..."

set -a
source /opt/outreach/.env.production
set +a

export IMAGE_TAG

echo "Deploying version: $IMAGE_TAG"
echo "ECR Registry: ${ECR_REGISTRY}"

echo "Logging into ECR..."

aws ecr get-login-password \
  --region "${AWS_REGION:-eu-north-1}" \
  | docker login \
      --username AWS \
      --password-stdin \
      "${ECR_REGISTRY}"

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

echo "Cleaning old images..."

docker image prune -af

echo "Current services:"

docker compose \
  --env-file .env.production \
  ps

echo "Deployment completed successfully."