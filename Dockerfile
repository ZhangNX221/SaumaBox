# ==========================================
# 🎮 SaumaBox — Production Dockerfile
# Base Image: Node.js 22 Alpine (LTS)
# ==========================================
FROM node:22-alpine

# Label Metadata
LABEL maintainer="SaumaDev <ZhangNX221>"
LABEL description="SaumaBox — All-in-One Personal Media Catalog & Archiving System"

# Install curl for container healthcheck
RUN apk add --no-cache curl tzdata

# Set working directory
WORKDIR /app

# Set default production environment
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0 \
    DATA_DIR=/app/data

# Copy dependency manifests
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev && npm cache clean --force

# Copy application source
COPY public ./public
COPY server ./server

# Prepare data and backups directories, set permissions for non-root 'node' user
RUN mkdir -p /app/data/backups && \
    chown -R node:node /app

# Switch to non-root user
USER node

# Expose web server port
EXPOSE 3000

# Persistent volume for SQLite database and backups
VOLUME ["/app/data"]

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start SaumaBox
CMD ["node", "server/index.js"]
