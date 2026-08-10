# Dockerfile para el reel-worker de OTC
# Multi-stage para imagen pequeña (~400 MB con FFmpeg)

# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-slim AS builder

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev --ignore-scripts

COPY tsconfig.json ./
COPY src ./src
RUN npm install -D typescript @types/node @types/express @types/fluent-ffmpeg @types/uuid
RUN npx tsc

# ─── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM node:20-slim AS runner

# Instalar FFmpeg desde repositorio oficial Debian
RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Dependencias de producción
COPY package.json ./
RUN npm install --omit=dev --ignore-scripts

# Código compilado
COPY --from=builder /app/dist ./dist

# Archivos de recursos (LUTs y música de fondo)
COPY luts ./luts

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Health check para Fly.io
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', r => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "dist/index.js"]
