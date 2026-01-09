# Multi-stage build for production
FROM node:18-alpine AS base

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Set node environment
ENV NODE_ENV=production

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# For development, install all dependencies
FROM base AS development

# Install dependencies (including dev dependencies for development)
COPY package*.json ./
RUN npm ci && npm cache clean --force

# Copy application code
COPY . .

# Create logs directory
RUN mkdir -p logs && chown -R nodejs:nodejs logs

# Switch to non-root user
USER nodejs

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "index.js"]