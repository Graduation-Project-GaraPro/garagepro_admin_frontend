# ---------- Builder stage ----------
FROM node:20.9.0-bullseye-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Nhận build args từ GitHub Actions
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_HUB_BASE_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID

ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_HUB_BASE_URL=${NEXT_PUBLIC_HUB_BASE_URL}
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=${NEXT_PUBLIC_GOOGLE_CLIENT_ID}

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 g++ make ca-certificates curl \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json yarn.lock* ./

RUN npm config set registry https://registry.npmjs.org/ \
  && npm config set fetch-retries 5 \
  && npm config set fetch-retry-factor 10 \
  && npm config set fetch-retry-mintimeout 20000 \
  && npm config set fetch-retry-maxtimeout 120000

RUN if [ -f package-lock.json ]; then \
      npm ci --prefer-offline --no-audit --no-fund; \
    elif [ -f yarn.lock ]; then \
      npm install -g yarn@1.22.22 && yarn install --frozen-lockfile --network-concurrency 1; \
    else \
      npm install --no-audit --no-fund; \
    fi

COPY . .

RUN npm run build

RUN npm prune --production || true
