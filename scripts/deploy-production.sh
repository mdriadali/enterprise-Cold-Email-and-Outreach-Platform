#!/usr/bin/env bash
set -euo pipefail

IMAGE_TAG=${1:?An image tag is required.}
AWS_REGION="eu-north-1"
SECRET_ID="outreach/production"

cd /opt/outreach

echo "========== FETCHING PRODUCTION SECRETS =========="
aws secretsmanager get-secret-value --secret-id "$SECRET_ID" --query SecretString --output text --region "$AWS_REGION" \
  | jq -r 'to_entries | .[] | "\(.key)=\(.value)"' > .env

echo "========== ECR LOGIN & PULL =========="
ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text --region "$AWS_REGION")
ECR_REGISTRY="${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

echo "Target Registry: $ECR_REGISTRY"
printf 'IMAGE_TAG=%s\nECR_REGISTRY=%s\n' "$IMAGE_TAG" "$ECR_REGISTRY" > .deploy.env

aws ecr get-login-password --region "$AWS_REGION" \
  | docker login --username AWS --password-stdin "$ECR_REGISTRY"

echo "========== DOCKER COMPOSE DEPLOY =========="
docker compose --env-file .deploy.env --env-file .env -f docker-compose.production.yml pull
docker compose --env-file .deploy.env --env-file .env -f docker-compose.production.yml run --rm migration
docker compose --env-file .deploy.env --env-file .env -f docker-compose.production.yml up -d --remove-orphans

prune_repository_to_two_images() {
  local repository=$1
  local image_ids=()

  # Docker lists the newest images first. Keep two tags per service for rollback.
  mapfile -t image_ids < <(docker image ls --format '{{.ID}}' "$repository" | awk '!seen[$0]++')

  for image_id in "${image_ids[@]:2}"; do
    # An image still used by a container is retained even if it is older.
    docker image rm "$image_id" >/dev/null 2>&1 || true
  done
}

echo "========== CLEANING UNUSED IMAGES =========="
prune_repository_to_two_images "$ECR_REGISTRY/outreach-http"
prune_repository_to_two_images "$ECR_REGISTRY/outreach-worker"
prune_repository_to_two_images "$ECR_REGISTRY/outreach-web"
docker image prune --force
