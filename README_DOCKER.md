# ASCS Server - Docker Setup

A Node.js/TypeScript server application with Prisma ORM, containerized with Docker for easy deployment and development.

## 🚀 Quick Start

### Prerequisites

- [Docker](https://www.docker.com/get-started) (version 20.10 or higher)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0 or higher)

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd ascs-server-prisma
```

### 2. Environment Configuration

Copy the environment template and configure your settings:

```bash
cp env.example .env
```

Edit `.env` file with your configuration:

```env
# Database Configuration
DATABASE_URL="mongodb://localhost:27017/ascs-database"

# Server Configuration
PORT=3000
NODE_ENV=development

# Frontend Configuration
FRONT_END_URL="http://localhost:3001"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here"
```

### 3. Build and Run

```bash
# Build the Docker image
docker-compose build

# Start the application
docker-compose up -d

# Check if it's running
docker-compose ps
```

The application will be available at: `http://localhost:3000`

## 📋 Docker Commands

### Build Commands

```bash
# Build with cache
docker-compose build

# Build without cache (clean build)
docker-compose build --no-cache

# Build specific service
docker-compose build app
```

### Run Commands

```bash
# Start in detached mode (background)
docker-compose up -d

# Start in foreground (see logs)
docker-compose up

# Stop the application
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Container Management

```bash
# View running containers
docker-compose ps

# View all containers (including stopped)
docker-compose ps -a

# Restart a service
docker-compose restart app

# Scale the service
docker-compose up -d --scale app=3
```

## 📊 Monitoring and Logs

### View Logs

```bash
# View all logs
docker-compose logs

# View logs for specific service
docker-compose logs app

# Follow logs in real-time
docker-compose logs -f app

# View last 100 lines
docker-compose logs --tail=100 app
```

### Health Check

The application includes a health check that monitors the service:

```bash
# Check health status
docker-compose ps

# Manual health check
curl http://localhost:3000/
```

Expected response:

```
Hello from Express + TypeScript + CORS + body-parser!
```

## 🔧 Development

### Local Development with Docker

```bash
# Start the application
docker-compose up -d

# View logs during development
docker-compose logs -f app

# Make changes to your code
# Rebuild and restart
docker-compose restart app
```

### Rebuilding After Code Changes

```bash
# Rebuild and restart
docker-compose up -d --build

# Or rebuild first, then restart
docker-compose build
docker-compose restart app
```

### Clean up Local Docker Desktop

```bash
docker image prune -f

# Or

docker system prune -a --volumes
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Container Won't Start

**Problem**: Container exits immediately or fails to start

**Solutions**:

```bash
# Check container logs
docker-compose logs app

# Check if port is already in use
netstat -an | grep :3000

# Try building without cache
docker-compose build --no-cache
```

#### 2. Module Not Found Errors

**Problem**: `Cannot find module 'cors'` or similar errors

**Solutions**:

```bash
# Ensure dependencies are in package.json dependencies (not devDependencies)
# Rebuild the image
docker-compose build --no-cache

# Check if node_modules is properly installed
docker-compose exec app ls -la node_modules/
```

#### 3. Database Connection Issues

**Problem**: Cannot connect to database

**Solutions**:

```bash
# Check DATABASE_URL in .env file
cat .env | grep DATABASE_URL

# Ensure MongoDB is running (if using local MongoDB)
# For Docker MongoDB, add to docker-compose.yml:
```

```yaml
services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
```

#### 4. Permission Issues

**Problem**: Permission denied errors

**Solutions**:

```bash
# Check file permissions
ls -la

# Fix ownership (Linux/Mac)
sudo chown -R $USER:$USER .

# On Windows, run Docker Desktop as Administrator
```

#### 5. Port Already in Use

**Problem**: Port 3000 is already in use

**Solutions**:

```bash
# Find what's using the port
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Mac/Linux

# Kill the process or change port in .env
# Change PORT=3000 to PORT=3001 in .env file
```

### Debugging Commands

```bash
# Enter the container shell
docker-compose exec app sh

# Check environment variables inside container
docker-compose exec app env

# Check if files are properly copied
docker-compose exec app ls -la /app

# Check if dist folder exists
docker-compose exec app ls -la /app/dist

# Check Node.js version
docker-compose exec app node --version

# Check npm version
docker-compose exec app npm --version
```

### Log Analysis

```bash
# Filter logs by keyword
docker-compose logs app | grep "ERROR"

# View logs with timestamps
docker-compose logs -t app

# Save logs to file
docker-compose logs app > app.log
```

## 🏗️ Production Deployment

### Environment Variables for Production

Update your `.env` file for production:

```env
NODE_ENV=production
DATABASE_URL="mongodb://your-production-db:27017/ascs-database"
JWT_SECRET="your-very-secure-production-secret"
FRONT_END_URL="https://your-frontend-domain.com"
```

### Docker Compose for Production

Create `docker-compose.prod.yml`:

```yaml
services:
  app:
    build: .
    ports:
      - "80:3000"
    env_file:
      - .env.production
    restart: always
    healthcheck:
      test:
        [
          "CMD",
          "wget",
          "--no-verbose",
          "--tries=1",
          "--spider",
          "http://localhost:3000/",
        ]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

Deploy with:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

Build Docker locally:

```bash
docker build -t my-backend-app .
docker run -p 8080:8080 my-backend-app
```

## 📁 Project Structure

```
ascs-server-prisma/
├── src/                    # Source code
│   ├── controllers/        # Route controllers
│   ├── models/            # Data models
│   ├── routes/            # API routes
│   ├── middlewares/       # Express middlewares
│   ├── app.ts             # Express app configuration
│   └── index.ts           # Application entry point
├── prisma/                # Prisma schema and migrations
├── logs/                  # Application logs
├── Dockerfile             # Docker image configuration
├── docker-compose.yml     # Docker Compose configuration
├── .dockerignore          # Files to ignore in Docker build
├── .env                   # Environment variables
├── package.json           # Node.js dependencies
└── tsconfig.json          # TypeScript configuration
```

## 🔗 API Endpoints

- `GET /` - Health check endpoint
- `POST /auth/*` - Authentication routes
- `GET /qr-code/*` - QR code generation
- `POST /req/*` - Requirements management
- `GET /student/*` - Student operations

## 📝 Useful Commands Summary

```bash
# Complete workflow
docker-compose build && docker-compose up -d

# View logs
docker-compose logs -f app

# Stop everything
docker-compose down

# Clean rebuild
docker-compose down && docker-compose build --no-cache && docker-compose up -d

# Check status
docker-compose ps

# Access container shell
docker-compose exec app sh
```

## 🆘 Getting Help

If you encounter issues:

1. Check the logs: `docker-compose logs app`
2. Verify environment variables: `cat .env`
3. Ensure Docker is running: `docker --version`
4. Check port availability: `netstat -an | grep :3000`

## 📄 License

This project is licensed under the ISC License.
