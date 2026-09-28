#!/usr/bin/env bash

set -euo pipefail

IMAGE_TAG="${1:?IMAGE_TAG is required}"

cd /opt/outreach

export IMAGE_TAG

echo "======================================"
echo "Deploying version: $IMAGE_TAG"
echo "======================================"

echo "Loading ECR configuration..."

ECR_REGISTRY=$(grep '^ECR_REGISTRY=' .env.production | cut -d '=' -f2-)

AWS_REGION="${AWS_REGION:-eu-north-1}"

echo "ECR Registry: $ECR_REGISTRY"
echo "AWS Region: $AWS_REGION"

echo "======================================"
echo "Logging into ECR..."
echo "======================================"

aws ecr get-login-password \
  --region "$AWS_REGION" \
  | docker login \
      --username AWS \
      --password-stdin \
      "$ECR_REGISTRY"

echo "======================================"
echo "Pulling images..."
echo "======================================"

docker compose \
  --env-file .env.production \
  pull

echo "======================================"
echo "Running database migrations..."
echo "======================================"

docker compose \
  --env-file .env.production \
  --profile migration \
  run --rm migration

echo "======================================"
echo "Starting services..."
echo "======================================"

docker compose \
  --env-file .env.production \
  up -d

echo "======================================"
echo "Cleaning old images..."
echo "======================================"

docker image prune -af

echo "======================================"
echo "Current services:"
echo "======================================"

docker compose \
  --env-file .env.production \
  ps

echo "======================================"
echo "Deployment completed successfully."
echo "======================================"