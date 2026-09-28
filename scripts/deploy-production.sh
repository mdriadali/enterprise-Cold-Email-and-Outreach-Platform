#!/usr/bin/env bash

set -e

IMAGE_TAG="$1"

cd /opt/outreach

echo "Deploying version: $IMAGE_TAG"

export IMAGE_TAG="$IMAGE_TAG"

echo "Logging into ECR..."

aws ecr get-login-password \
  --region eu-north-1 \
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