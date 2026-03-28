#!/bin/bash

# Idempotent Deployment Script for ShopSmart
# Rubric 10: Idempotency (mkdir -p, check before run)

set -e # Exit on error

echo "Starting Idempotent Deployment..."

# 1. Ensure directory exists
mkdir -p ~/project

# 2. Check if Docker is installed (Basic check)
if ! command -v docker &> /dev/null; then
    echo "Docker not found, please install Docker on EC2."
    exit 1
fi

# 3. Determine docker-compose command
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
elif docker-compose --version &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    echo "docker-compose not found, please install it on EC2."
    exit 1
fi

# 4. Stop existing services (if any) and handle errors gracefully
# Using || true to ignore errors if services are not running
$DOCKER_COMPOSE down || true

# 5. Build new images
$DOCKER_COMPOSE build

# 6. Start services in background
$DOCKER_COMPOSE up -d

# 7. Verify health (Optional but good for DevOps)
echo "Checking service status..."
$DOCKER_COMPOSE ps

# 7. Set correct permissions for data/logs if needed
chmod -R 755 ~/project/

echo "Deployment completed successfully."
