# ---------- Builder stage ----------
FROM node:20.9.0-bullseye-slim AS builder
WORKDIR /app

# NOTE: don't set NODE_ENV=production here — we need devDeps for build
ENV NEXT_TELEMETRY_DISABLED=1

# Install build tools
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 g++ make ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy package manifests for caching
COPY package*.json ./

# Install all deps including devDependencies (needed for building TS next.config, etc.)
# trước khi chạy npm ci
RUN npm config set registry https://registry.npmjs.org/ \
    && npm config set fetch-retries 5 \
    && npm config set fetch-retry-factor 10 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000
RUN npm ci


# Copy source
COPY . .

# Build
RUN npm run build

# Remove devDependencies to keep node_modules small (prune production only)
RUN npm prune --production

# ---------- Runner stage ----------
FROM node:20-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Install runtime dependencies (curl for healthcheck)
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json & production node_modules and build output from builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
#COPY --from=builder /app/next.config.ts ./next.config.ts

# Create unprivileged user and adjust ownership
RUN useradd --user-group --create-home --shell /bin/false appuser \
    && chown -R appuser:appuser /app

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

CMD ["npx", "next", "start", "-p", "3000"]
