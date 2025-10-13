# Render Deployment Guide

This guide explains how to set up automated deployment to Render using the GitHub Actions CI/CD pipeline.

## Prerequisites

1. **Render Account**: Create a free account at [render.com](https://render.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Render Service**: Create a Web Service on Render

## Setup Instructions

### 1. Create Render Web Service

1. Go to your Render dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `ascs-server-prisma` (or your preferred name)
   - **Environment**: `Docker`
   - **Dockerfile Path**: `Dockerfile` (or leave default)
   - **Auto-Deploy**: `Yes` (optional, since we're using GitHub Actions)

### 2. Get Required Information from Render

After creating the service, collect these values:

1. **Service ID**: Found in the service URL or settings
2. **Service URL**: The public URL of your deployed service
3. **API Key**: Generate from Account Settings → API Keys

### 3. Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions, and add:

| Secret Name          | Description                     | Example                               |
| -------------------- | ------------------------------- | ------------------------------------- |
| `RENDER_API_KEY`     | Your Render API key             | `rnd_xxxxxxxxxxxxx`                   |
| `RENDER_SERVICE_ID`  | Your Render service ID          | `srv-xxxxxxxxxxxxx`                   |
| `RENDER_SERVICE_URL` | Your service URL                | `https://your-app.onrender.com`       |
| `DATABASE_URL`       | Your database connection string | `postgresql://...` or `mongodb://...` |
| `JWT_SECRET`         | Your JWT secret key             | `your-super-secret-jwt-key`           |

### 4. Environment Variables

Make sure these environment variables are configured in your Render service:

```bash
NODE_ENV=production
PORT=10000
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
```

## Deployment Process

### Automatic Deployment

The workflow triggers automatically when you push to the `main` branch:

1. **Build**: Installs dependencies, generates Prisma client, builds TypeScript
2. **Test**: Runs tests (if configured)
3. **Docker Build**: Creates Docker image
4. **Docker Test**: Tests the Docker container
5. **Deploy**: Deploys to Render using Render CLI
6. **Health Check**: Verifies deployment success
7. **Cleanup**: Removes temporary Docker images

### Manual Deployment

You can trigger manual deployments:

1. Go to GitHub Actions tab in your repository
2. Select "Deploy to Render" workflow
3. Click "Run workflow"
4. Choose the branch and click "Run workflow"

### Rollback

To rollback to a previous deployment:

1. Go to GitHub Actions tab
2. Select "Deploy to Render" workflow
3. Click "Run workflow"
4. Select "Rollback" from the action dropdown
5. Click "Run workflow"

## Workflow Features

### ✅ What's Included

- **Automated builds** on push to main
- **Dependency caching** for faster builds
- **Prisma client generation**
- **TypeScript compilation**
- **Docker image building and testing**
- **Automated deployment to Render**
- **Health checks** after deployment
- **Rollback capability**
- **Resource cleanup**

### 🔧 Customization Options

You can customize the workflow by modifying `.github/workflows/cd.yml`:

1. **Change trigger branches**: Modify the `branches` array
2. **Add more environment variables**: Add them to the deploy step
3. **Modify health check endpoint**: Update the health check step
4. **Add notification steps**: Integrate with Slack, Discord, etc.

## Troubleshooting

### Common Issues

1. **Deployment fails with "Service not found"**

   - Check your `RENDER_SERVICE_ID` secret
   - Ensure the service exists in Render

2. **Environment variables not working**

   - Verify all required secrets are set in GitHub
   - Check environment variables in Render dashboard

3. **Docker build fails**

   - Check Dockerfile syntax
   - Verify all required files are present

4. **Health check fails**
   - Ensure your app has a root endpoint (`/`)
   - Check if the app starts correctly in production mode

### Debug Steps

1. **Check GitHub Actions logs**: Go to Actions tab → Click on failed workflow → Review logs
2. **Check Render logs**: Go to Render dashboard → Your service → Logs tab
3. **Test locally**: Run `docker build .` and `docker run` locally
4. **Verify secrets**: Ensure all GitHub secrets are correctly set

## Security Best Practices

1. **Never commit secrets** to your repository
2. **Use strong JWT secrets** (at least 32 characters)
3. **Regularly rotate API keys**
4. **Enable HTTPS** in Render (automatic)
5. **Use environment-specific configurations**

## Performance Optimization

1. **Enable dependency caching** (already configured)
2. **Use multi-stage Docker builds** (already implemented)
3. **Optimize Docker image size** (already configured)
4. **Monitor resource usage** in Render dashboard

## Support

- **Render Documentation**: [render.com/docs](https://render.com/docs)
- **GitHub Actions**: [docs.github.com/actions](https://docs.github.com/actions)
- **Docker**: [docs.docker.com](https://docs.docker.com)

---

**Next Steps**: After setting up the secrets and testing the deployment, consider adding monitoring, logging, and backup strategies for production use.
