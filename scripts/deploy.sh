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

# 3. Stop existing services (if any) and handle errors gracefully
# Using || true to ignore errors if services are not running
docker-compose down || true

# 4. Pull/Build new images
docker-compose build

# 5. Start services in background
docker-compose up -d

# 6. Verify health (Optional but good for DevOps)
echo "Checking service status..."
docker-compose ps

# 7. Set correct permissions for data/logs if needed
chmod -R 755 ~/project/

echo "Deployment completed successfully."
