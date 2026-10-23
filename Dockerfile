# ==========================================
# 🎮 SaumaBox — Production Dockerfile
# Base Image: Node.js 22 Alpine (LTS)
# ==========================================
FROM node:22-alpine

# Label Metadata
LABEL maintainer="SaumaDev <ZhangNX221>"
LABEL description="SaumaBox — Modern Self-Hosted Personal Media Catalog & Archiving System for Games, Cinema & Music"

# Install curl and tzdata for healthcheck & timezone support
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

# Prepare data, backups, uploads, and covers directories
RUN mkdir -p /app/data/backups /app/data/uploads /app/public/images/covers

# Expose internal web server port
EXPOSE 3000

# Persistent volume for SQLite database, uploads, and backups
VOLUME ["/app/data"]

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start SaumaBox
CMD ["node", "server/index.js"]
