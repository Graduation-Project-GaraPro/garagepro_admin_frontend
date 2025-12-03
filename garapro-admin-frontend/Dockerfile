# ---------- Builder stage ----------
FROM node:20.9.0-bullseye-slim AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 g++ make ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*

# Copy only package manifests from subfolder into /app (so npm sees package.json at /app)
COPY garapro-admin-frontend/package*.json ./ 
COPY garapro-admin-frontend/yarn.lock* ./

# npm resilience
RUN npm config set registry https://registry.npmjs.org/ \
    && npm config set fetch-retries 5 \
    && npm config set fetch-retry-factor 10 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000

# Install deps (lockfile-aware fallback handled as before)
RUN if [ -f package-lock.json ]; then \
      npm ci --prefer-offline --no-audit --no-fund; \
    elif [ -f yarn.lock ]; then \
      npm install -g yarn@1.22.22 && yarn install --frozen-lockfile --network-concurrency 1; \
    else \
      npm install --no-audit --no-fund; \
    fi

# Copy project source from subfolder into /app
COPY garapro-admin-frontend/ ./

# Build
RUN npm run build

# Prune dev deps
RUN npm prune --production || true

# ---------- Runner stage ----------
FROM node:20-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

RUN useradd --user-group --create-home --shell /bin/false appuser \
    && chown -R appuser:appuser /app
USER appuser

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD curl -f http://localhost:3000/ || exit 1
CMD ["npx","next","start","-p","3000"]
