#!/bin/bash

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Docker Hub settings
REPO="tomasossac/api"
SERVICE="api"
VERSION=${API_VERSION:-$(date +%Y%m%d-%H%M%S)}

echo "🔨 Building Docker image..."
docker build -t ${REPO}:${SERVICE}-${VERSION} .
docker tag ${REPO}:${SERVICE}-${VERSION} ${REPO}:${SERVICE}-latest

echo "📤 Pushing to Docker Hub..."
docker push ${REPO}:${SERVICE}-${VERSION}
docker push ${REPO}:${SERVICE}-latest

echo "🚀 Starting services..."
export API_VERSION=${VERSION}
docker-compose pull api
docker-compose up -d

echo "✅ Deployment complete!"
echo "📦 Images pushed:"
echo "  - ${REPO}:${SERVICE}-${VERSION}"
echo "  - ${REPO}:${SERVICE}-latest"
echo "🌐 API running at: http://localhost:5000"
echo "☁️ Cloudflare tunnel active"