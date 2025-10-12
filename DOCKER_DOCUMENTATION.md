# 🐳 Docker Documentation for ASCS Server

A comprehensive guide to Docker implementation for the **Academic Student Clearance System (ASCS)** server project.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Project Docker Structure](#project-docker-structure)
- [Dockerfile Analysis](#dockerfile-analysis)
- [Docker Compose Configuration](#docker-compose-configuration)
- [Best Practices](#best-practices)
- [Docker Commands Reference](#docker-commands-reference)
- [Development Workflow](#development-workflow)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)
- [Tips & Tricks](#tips--tricks)

---

## 🎯 Overview

This project uses Docker for containerization to ensure consistent development and production environments. The setup includes:

- **Development Environment**: Hot reloading with live code sync
- **Production Environment**: Optimized, secure, and scalable containers
- **Multi-stage builds** for efficient image creation
- **Health checks** for container monitoring
- **Volume mounting** for persistent data

---

## 📁 Project Docker Structure

```
ascs-server-prisma/
├── 🐳 Dockerfile                    # Production container
├── 🐳 Dockerfile.dev               # Development container
├── 🐳 docker-compose.yaml          # Production orchestration
├── 🐳 docker-compose.dev.yaml      # Development orchestration
└── 📄 .env                        # Environment variables
```

---

## 🏗️ Dockerfile Analysis

### Production Dockerfile (`Dockerfile`)

```dockerfile
# Use Node LTS as the base image
FROM node:18-alpine
```

**Purpose**: Uses Alpine Linux (lightweight) with Node.js 18 LTS for stability and security.

```dockerfile
# Set working directory inside container
WORKDIR /app
```

**Purpose**: Creates and sets `/app` as the working directory inside the container.

```dockerfile
# Install dependencies for building native modules and healthcheck
RUN apk add --no-cache python3 make g++ wget
```

**Purpose**:

- `python3`, `make`, `g++`: Required for building native Node.js modules (like bcrypt)
- `wget`: Used for health checks
- `--no-cache`: Reduces image size by not storing package cache

```dockerfile
# Copy package files first for better caching
COPY package*.json ./
```

**Purpose**: Docker layer caching - dependencies only reinstall when package files change.

```dockerfile
# Install all dependencies (including dev dependencies for building)
RUN npm ci --only=production=false
```

**Purpose**:

- `npm ci`: Faster, reliable installs for CI/CD
- `--only=production=false`: Includes dev dependencies needed for TypeScript compilation

```dockerfile
# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript (this will create the dist folder)
RUN npm run build
```

**Purpose**:

- Copies all source code
- Generates Prisma client for database operations
- Compiles TypeScript to JavaScript in `dist/` folder

```dockerfile
# Remove dev dependencies to reduce image size
RUN npm ci --only=production && npm cache clean --force
```

**Purpose**: Security and size optimization - removes unnecessary dev dependencies.

```dockerfile
# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs
```

**Purpose**: **Security best practice** - runs container as non-root user to prevent privilege escalation.

```dockerfile
# Expose port and set environment
EXPOSE 3000
ENV PORT=3000
CMD ["npm", "start"]
```

**Purpose**:

- Exposes port 3000 for external access
- Sets default port environment variable
- Starts the production application

### Development Dockerfile (`Dockerfile.dev`)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

**Purpose**:

- Simplified for development with hot reloading
- Uses Node 20 for latest features
- Runs in development mode with `nodemon`

---

## 🔧 Docker Compose Configuration

### Production (`docker-compose.yaml`)

```yaml
services:
  app:
    build: . # Build from current directory
    ports:
      - "3000:3000" # Map host port 3000 to container port 3000
    env_file:
      - .env # Load environment variables from .env
    container_name: online_clearance_prod
    environment:
      - NODE_ENV=development # ⚠️ Should be 'production' in real deployment
      - PORT=3000
    volumes:
      - ./logs:/app/logs # Mount logs directory for persistence
    restart: unless-stopped # Auto-restart on failure
    healthcheck: # Container health monitoring
      test:
        [
          "CMD",
          "wget",
          "--no-verbose",
          "--tries=1",
          "--spider",
          "http://localhost:3000/",
        ]
      interval: 30s # Check every 30 seconds
      timeout: 10s # Timeout after 10 seconds
      retries: 3 # Retry 3 times before marking unhealthy
      start_period: 40s # Wait 40s before first check
```

### Development (`docker-compose.dev.yaml`)

```yaml
version: "3.9"
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev # Use development Dockerfile
    container_name: app-dev
    ports:
      - "3000:3000"
    develop:
      watch: # Live reload functionality
        - action: sync # Sync file changes
          path: ./src
          target: /app/src
        - action: rebuild # Rebuild on package.json changes
          path: package.json
```

**Purpose**:

- `sync`: Instantly reflects code changes without rebuilding
- `rebuild`: Rebuilds container when dependencies change

---

## ✅ Best Practices

### 1. **Security Best Practices**

```dockerfile
# ✅ DO: Use non-root user
RUN adduser -S nodejs -u 1001
USER nodejs

# ✅ DO: Use specific base image versions
FROM node:18-alpine

# ✅ DO: Remove package cache
RUN npm cache clean --force
```

### 2. **Performance Best Practices**

```dockerfile
# ✅ DO: Leverage Docker layer caching
COPY package*.json ./
RUN npm ci --only=production=false
COPY . .

# ✅ DO: Use .dockerignore
echo "node_modules" >> .dockerignore
echo ".git" >> .dockerignore
echo "*.log" >> .dockerignore
```

### 3. **Image Size Optimization**

```dockerfile
# ✅ DO: Multi-stage builds for production
FROM node:18-alpine AS builder
# ... build steps
FROM node:18-alpine AS production
COPY --from=builder /app/dist ./dist
```

### 4. **Environment Management**

```yaml
# ✅ DO: Use env_file for sensitive data
env_file:
  - .env

# ✅ DO: Set proper NODE_ENV
environment:
  - NODE_ENV=production
```

---

## 🚀 Docker Commands Reference

### **Basic Commands**

```bash
# Build an image
docker build -t ascs-server .

# Build with specific Dockerfile
docker build -f Dockerfile.dev -t ascs-server:dev .

# Run a container
docker run -p 3000:3000 --env-file .env ascs-server

# Run in detached mode
docker run -d -p 3000:3000 --name ascs-app ascs-server

# Stop a container
docker stop ascs-app

# Remove a container
docker rm ascs-app

# Remove an image
docker rmi ascs-server
```

### **Docker Compose Commands**

```bash
# Start services (production)
docker-compose up -d

# Start services (development)
docker-compose -f docker-compose.dev.yaml up -d

# Build and start
docker-compose up --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart a specific service
docker-compose restart app
```

### **Development Commands**

```bash
# Start with live reload
docker-compose -f docker-compose.dev.yaml up --build

# View development logs
docker-compose -f docker-compose.dev.yaml logs -f app

# Execute commands in running container
docker-compose exec app sh
docker-compose exec app npm run prisma:studio
```

### **Debugging Commands**

```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# View container logs
docker logs ascs-app

# Inspect container
docker inspect ascs-app

# Execute shell in container
docker exec -it ascs-app sh

# Check container resource usage
docker stats ascs-app
```

### **Cleanup Commands**

```bash
# Remove unused containers, networks, images
docker system prune

# Remove everything (including volumes)
docker system prune -a --volumes

# Remove specific image
docker rmi $(docker images -q ascs-server)

# Clean up build cache
docker builder prune
```

---

## 💻 Development Workflow

### **1. Initial Setup**

```bash
# Clone and setup
git clone <repository>
cd ascs-server-prisma

# Create .env file
cp .env.example .env
# Edit .env with your configuration

# Start development environment
docker-compose -f docker-compose.dev.yaml up --build
```

### **2. Daily Development**

```bash
# Start development server
docker-compose -f docker-compose.dev.yaml up

# Make code changes (auto-synced)
# Access application at http://localhost:3000

# View logs
docker-compose -f docker-compose.dev.yaml logs -f
```

### **3. Database Operations**

```bash
# Access database (if using external DB)
docker-compose exec app npx prisma studio

# Run migrations
docker-compose exec app npx prisma migrate dev

# Reset database
docker-compose exec app npx prisma migrate reset
```

---

## 🚢 Production Deployment

### **1. Build Production Image**

```bash
# Build optimized production image
docker build -t ascs-server:latest .

# Tag for registry
docker tag ascs-server:latest your-registry/ascs-server:v1.0.0
```

### **2. Deploy with Docker Compose**

```bash
# Set production environment
export NODE_ENV=production

# Deploy
docker-compose up -d

# Verify deployment
docker-compose ps
docker-compose logs -f
```

### **3. Health Monitoring**

```bash
# Check container health
docker-compose ps

# View health check logs
docker inspect ascs-app | grep -A 10 Health

# Test endpoint
curl http://localhost:3000/
```

---

## 🔍 Troubleshooting

### **Common Issues & Solutions**

#### **1. Port Already in Use**

```bash
# Error: Port 3000 already in use
# Solution: Use different port or stop existing service
docker-compose down
# Or change port in docker-compose.yaml
```

#### **2. Permission Denied**

```bash
# Error: Permission denied in container
# Solution: Fix file permissions
sudo chown -R $USER:$USER .
```

#### **3. Database Connection Issues**

```bash
# Check environment variables
docker-compose exec app env | grep DATABASE

# Verify network connectivity
docker-compose exec app ping your-db-host
```

#### **4. Build Failures**

```bash
# Clean build cache
docker builder prune

# Rebuild without cache
docker-compose build --no-cache
```

#### **5. Container Won't Start**

```bash
# Check logs for errors
docker-compose logs app

# Debug with interactive shell
docker-compose run --rm app sh
```

---

## 💡 Tips & Tricks

### **1. Development Efficiency**

```bash
# Quick restart after config changes
docker-compose restart app

# Watch logs in real-time
docker-compose logs -f --tail=100 app

# Run one-off commands
docker-compose exec app npm run test
```

### **2. Performance Optimization**

```bash
# Use BuildKit for faster builds
export DOCKER_BUILDKIT=1

# Parallel builds
docker-compose build --parallel

# Multi-stage builds for smaller images
docker build --target production .
```

### **3. Security Enhancements**

```bash
# Scan images for vulnerabilities
docker scan ascs-server

# Use secrets for sensitive data
echo "my-secret" | docker secret create db_password -
```

### **4. Monitoring & Debugging**

```bash
# Resource monitoring
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Network debugging
docker network ls
docker network inspect ascs-server-prisma_default

# Volume inspection
docker volume ls
docker volume inspect ascs-server-prisma_logs
```

### **5. CI/CD Integration**

```yaml
# GitHub Actions example
- name: Build and test
  run: |
    docker-compose -f docker-compose.dev.yaml up --build -d
    docker-compose -f docker-compose.dev.yaml exec -T app npm test
```

---

## 📚 Additional Resources

- [Docker Official Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
- [Prisma with Docker](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-docker)

---

## 🎯 Next Steps

1. **Add Database Container**: Include MongoDB in docker-compose for complete local development
2. **Implement CI/CD**: Set up automated testing and deployment
3. **Add Monitoring**: Integrate logging and monitoring solutions
4. **Security Hardening**: Implement additional security measures
5. **Performance Tuning**: Optimize for production workloads

---

_This documentation is tailored for the ASCS (Academic Student Clearance System) project. For questions or contributions, please refer to the project repository._
