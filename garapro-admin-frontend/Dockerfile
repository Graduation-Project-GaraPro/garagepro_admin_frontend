# ---------- Builder stage ----------
FROM node:20.9.0-bullseye-slim AS builder
WORKDIR /app

# Disable next telemetry (build-time)
ENV NEXT_TELEMETRY_DISABLED=1

# Install build tools
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 g++ make ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*

# Copy lockfiles/manifests for caching. includes yarn.lock if present.
COPY package*.json yarn.lock* ./garapro-admin-frontend

# Configure npm resilience
RUN npm config set registry https://registry.npmjs.org/ \
    && npm config set fetch-retries 5 \
    && npm config set fetch-retry-factor 10 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000

# Install deps: prefer lockfile-aware command; fallback safely
RUN if [ -f package-lock.json ]; then \
      echo "Using npm ci"; \
      npm ci --prefer-offline --no-audit --no-fund; \
    elif [ -f yarn.lock ]; then \
      echo "Using yarn install"; \
      npm install -g yarn@1.22.22 && yarn install --frozen-lockfile --network-concurrency 1; \
    else \
      echo "No lockfile found — using npm install"; \
      npm install --no-audit --no-fund; \
    fi

# Copy app source
COPY . .

# Build the Next.js app (builder has devDeps)
RUN npm run build

# Prune devDependencies to keep node_modules small for runtime
RUN npm prune --production || true

# ---------- Runner stage ----------
FROM node:20-bullseye-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Install runtime deps for healthcheck (curl)
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy necessary artifacts from builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
# Do NOT copy next.config.ts to runner (avoid runtime TS transpile)

# Create a non-root user
RUN useradd --user-group --create-home --shell /bin/false appuser \
    && chown -R appuser:appuser /app

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["npx", "next", "start", "-p", "3000"]
