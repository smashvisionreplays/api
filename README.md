# SmashVision Main API

Main API server for SmashVision platform with YouTube live streaming integration via Clerk authentication.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Cloudflare tunnel token (for web exposure)

### Environment Setup

1. **Configure environment variables in `.env`:**
```env
# Database
DB_HOST=your-database-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_your-key
CLERK_SECRET_KEY=sk_test_your-key

# YouTube API
YOUTUBE_CLIENT_ID=your-youtube-client-id
YOUTUBE_CLIENT_SECRET=your-youtube-client-secret
YOUTUBE_API_KEY=your-youtube-api-key

# Cloudflare
CLOUDFLARE_API_KEY=your-cloudflare-api-key
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
CLOUDFLARE_TUNNEL_TOKEN=your-cloudflare-tunnel-token

# Versioning (optional)
API_VERSION=1.0.0
```

## 🏃‍♂️ Running Locally

### Option 1: Node.js (Development)
```bash
# Install dependencies
npm install

# Start server
npm start
```
Server runs at: `http://localhost:5000`

### Option 2: Docker (Production-like)
```bash
# Build and run locally
docker build -t api .
docker run -p 5000:5000 --env-file .env api
```

### Option 3: Docker Compose (Recommended)
```bash
# Run with Cloudflare tunnel
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🌐 Web Exposure with Cloudflare Tunnel

### Setup Cloudflare Tunnel
1. Create tunnel in cloudflare manually, make sure the http:api/8080 setup in tunnel idnicated the container name of the app being exposes through the tunnel must have the name api.
2. If you want to run it manually instead of with docker compose: 
    docker run --detach --name api-tunnel --network api cloudflare/cloudflared:latest tunnel --no-autoupdate run --token <YOUR_CLOUDFLARE_TUNNEL_TOKEN>
3. Add token to `.env` file so docker compose can use it and execute docker compose up

### Run with Tunnel
```bash
# Start API + Cloudflare tunnel
docker-compose up -d

# Check tunnel status
docker-compose logs api-tunnel
```

Your API will be accessible via your Cloudflare tunnel URL.

## 📦 Docker Hub Operations

### Pull Latest Image
```bash
# Pull latest main API
docker pull tomasossac/api:latest

# Pull specific version
docker pull tomasossac/api:1.0.0

# Run pulled image
docker run -p 5000:5000 --env-file .env tomasossac/api:latest
```

### Build & Push to Docker Hub

#### Automated Deploy (Recommended)
```bash
# Linux/Mac
./deploy.sh

# Windows
deploy.bat

# Deploy with specific version
cmd /c "set API_VERSION=2.0.0 && deploy.bat"
```

This will:
- Build the image
- Push to `tomasossac/api:{version}`
- Push to `tomasossac/api:latest`
- Start services with Cloudflare tunnel

#### Manual Push
```bash
# Build image
docker build -t tomasossac/api:api-1.0.0 .
docker tag tomasossac/api:1.0.0 tomasossac/api:api-latest

# Push to Docker Hub
docker push tomasossac/api:api-1.0.0
docker push tomasossac/api:api-latest
```

### Version Management
```bash
# Deploy with specific version
API_VERSION=2.0.0 ./deploy.sh

# Deploy with auto-generated timestamp version
./deploy.sh
```

## 🔧 Available Commands

| Command | Description |
|---------|-------------|
| `npm start` | Run locally with Node.js |
| `docker-compose up -d` | Run with Docker + Cloudflare tunnel |
| `docker-compose down` | Stop all services |
| `docker-compose logs -f` | View live logs |
| `docker-compose pull api` | Pull latest image from registry |
| `./deploy.sh or ./deply.bat` | Build, push, and deploy |

## 📋 API Endpoints

- **Health**: `GET /`
- **Clubs**: `GET /api/clubs`
- **Videos**: `GET /api/videos`
- **YouTube**: `POST /api/youtube/create-live`
- **Cameras**: `GET /api/cameras`

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │───▶│   Main API       │───▶│   Database      │
│   (React)       │    │   (This Server)  │    │   (MySQL)       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   Cloudflare     │
                       │   Tunnel         │
                       └──────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   Internet       │
                       │   Access         │
                       └──────────────────┘
```

## 🔍 Troubleshooting

### Common Issues
- **Port 5000 in use**: Change `PORT` in `.env`
- **Database connection**: Verify DB credentials in `.env`
- **Cloudflare tunnel**: Check tunnel token and status
- **YouTube auth**: Ensure Clerk and YouTube credentials are correct

### Logs
```bash
# View API logs
docker-compose logs api

# View tunnel logs
docker-compose logs api-tunnel

# View all logs
docker-compose logs -f
```