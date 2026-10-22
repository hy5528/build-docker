# syntax=docker/dockerfile:1.7

# ==========================================
# 1. 编译 Go 后端服务 (server)
# ==========================================
FROM --platform=$BUILDPLATFORM golang:tip-alpine3.23 AS server-builder

ENV GO111MODULE=on \
    CGO_ENABLED=0 \
    GOOS=linux \
    TZ=Asia/Shanghai

ARG TARGETARCH

WORKDIR /src
COPY server/go.mod server/go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod go mod download

COPY server/ .
RUN --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 GOOS=linux \
    go build -ldflags="-s -w" -o /build/gofilm ./main.go
# ==========================================
# 2. 编译 Next.js 前端应用 (web)
# ==========================================
FROM --platform=$BUILDPLATFORM node:20-alpine AS web-deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY client/package.json ./
RUN --mount=type=cache,target=/root/.npm npm install

FROM --platform=$BUILDPLATFORM node:20-alpine AS web-builder
WORKDIR /app
COPY --from=web-deps /app/node_modules ./node_modules
COPY client/ .

ENV NEXT_TELEMETRY_DISABLED=1
ARG API_URL=http://127.0.0.1:3601
ENV API_URL=${API_URL}

RUN --mount=type=cache,target=/app/.next/cache npm run build

# ==========================================
# 3. 运行环境 (Runner): 合并为一个镜像
# ==========================================
FROM node:20-alpine AS runner


ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    TZ=Asia/Shanghai \
    PORT=3601 \
    API_URL=http://127.0.0.1:3601

RUN apk add --no-cache ca-certificates tzdata supervisor

WORKDIR /app

# 拷贝 Go 服务二进制文件及迁移工具
COPY --from=server-builder /build/gofilm /app/server/main


# 拷贝 Next.js 产物
COPY --from=web-builder /app/public /app/web/public
COPY --from=web-builder /app/.next/standalone /app/web/
COPY --from=web-builder /app/.next/static /app/web/.next/static

# Supervisord 进程配置
COPY supervisord.conf /etc/supervisord.conf

EXPOSE 3600 3601

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
