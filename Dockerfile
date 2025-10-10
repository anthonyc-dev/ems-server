# Use Node LTS as the base image
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Install dependencies for building native modules and healthcheck
RUN apk add --no-cache python3 make g++ wget

# Copy package files first for better caching
COPY package*.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript (this will create the dist folder)
RUN npm run build

# Verify the build output
RUN ls -la dist/

# Remove dev dependencies to reduce image size
RUN npm ci --only=production && npm cache clean --force

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port (default to 3000 if PORT not set)
EXPOSE 3000

# Set default port
ENV PORT=3000

# Start your app
CMD ["npm", "start"]
