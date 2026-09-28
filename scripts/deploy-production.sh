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