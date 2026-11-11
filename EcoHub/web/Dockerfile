# ---- Base Stage ----
FROM --platform=$BUILDPLATFORM node:20-alpine AS build-base

# ---- Dependencies Stage ----
FROM build-base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
# package-lock.json 已入库，npm ci 严格按 lockfile 安装，杜绝依赖版本漂移
COPY package.json package-lock.json ./
COPY patches ./patches
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# ---- Builder Stage ----
FROM build-base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ARG API_URL=http://127.0.0.1:8080
ENV API_URL=${API_URL}

RUN --mount=type=cache,target=/app/.next/cache \
    npm run build

# ---- Runner Stage ----
FROM node:20-alpine AS runner
WORKDIR /app


ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    TZ=Asia/Shanghai \
    PORT=8080 \
    LISTENER_PORT=8080 \
    HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
