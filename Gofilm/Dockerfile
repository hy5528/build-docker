FROM --platform=$BUILDPLATFORM node:20-alpine AS web-deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

FROM --platform=$BUILDPLATFORM node:20-alpine AS web-builder
WORKDIR /app
COPY --from=web-deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ARG API_URL=http://127.0.0.1:3601
ENV API_URL=${API_URL}

RUN --mount=type=cache,target=/app/.next/cache npm run build

# ==========================================
# 3. 运行环境 (Runner): 合并为一个镜像
# ==========================================
FROM node:20-alpine AS runner

LABEL org.opencontainers.image.title="EcoHub All-in-One" \
      org.opencontainers.image.description="EcoHub All-in-One single image containing both Go server and Next.js web." \
      org.opencontainers.image.source="https://github.com/fe-spark/EcoHub"



RUN apk add --no-cache ca-certificates tzdata supervisor

WORKDIR /app

# 拷贝 Next.js 产物
COPY --from=web-builder /app/public /app/web/public
COPY --from=web-builder /app/.next/standalone /app/web/
COPY --from=web-builder /app/.next/static /app/web/.next/static


# Supervisord 进程配置
COPY supervisord.conf /etc/supervisord.conf

EXPOSE 3000 8080

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
