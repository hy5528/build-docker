# ============================================================
# GoReader (Go) 多阶段构建
#   - Go 后端：CGO_ENABLED=0 静态链接（纯 Go SQLite 驱动 glebarez/sqlite，
#     无 C 依赖；goja JS 引擎纯 Go——比 Rust 版 musl 构建更简单）
#   - 前端：web-ui（Vue 3 + shadcn-vue）→ dist
#   - 运行镜像内置 obscura（浏览器后端，CDP 质询求解——Go 原生，无 Python）
#   - GIT_SHA：镜像版本号（CI 传入短 SHA；本地构建默认 dev）
#   - 构建：docker build --build-arg GIT_SHA=abc1234 -t GoReader .
# ============================================================
ARG GIT_SHA=dev

# ---------- 阶段 1：Go 后端编译 ----------
FROM golang:1.25 AS builder
ARG GIT_SHA
WORKDIR /app
# 依赖层缓存（go.mod/go.sum 未变则复用层）
COPY go.mod go.sum ./
RUN go mod download
COPY cmd ./cmd
COPY internal ./internal
ENV CGO_ENABLED=0
# -X main.buildVersion 注入版本号（后端启动日志/health 可见）
RUN go build -trimpath -ldflags="-s -w -X main.buildVersion=${GIT_SHA}" -o /out/GoReader ./cmd/server

# ---------- 阶段 2：前端构建 ----------
FROM node:22-slim AS web
ARG GIT_SHA
WORKDIR /web
COPY web-ui/package.json web-ui/package-lock.json* ./
RUN npm install
COPY web-ui ./
# 构建期校验：打印前端源码指纹与版本号，确认每次构建使用最新 web-ui
RUN echo "== web-ui source fingerprint (md5) ==" \
    && find . -type f -not -path "./node_modules/*" -not -name package-lock.json | sort | xargs md5sum | md5sum \
    && echo "== build tag: ${GIT_SHA} =="
ENV VITE_APP_VERSION=${GIT_SHA}
RUN npm run build

# ---------- 阶段 3：obscura 浏览器（release stealth 构建——BoringSSL TLS 指纹模拟/反检测/追踪器拦截；仅 amd64） ----------
FROM debian:trixie-slim AS obscura
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
RUN set -eux; \
    curl -fL --retry 3 -o /tmp/obscura.tar.gz \
      "https://github.com/h4ckf0r0day/obscura/releases/latest/download/obscura-x86_64-linux-stealth.tar.gz"; \
    mkdir -p /opt/obscura; \
    tar xzf /tmp/obscura.tar.gz -C /opt/obscura; \
    rm /tmp/obscura.tar.gz; \
    test -x /opt/obscura/obscura; \
    ls -la /opt/obscura

# ---------- 阶段 4：运行镜像 ----------
FROM debian:trixie-slim

# 时区 + CA + tini（PID 1 信号转发）+ CJK 字体
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        tzdata \
        tini \
        fonts-noto-cjk \
    && rm -rf /var/lib/apt/lists/*

# obscura 浏览器（唯一后端——stealth 构建：BoringSSL TLS 指纹模拟/反检测/追踪器拦截；
# 官方 distroless 运行验证仅需 glibc，无需额外系统库）
COPY --from=obscura /opt/obscura /opt/obscura

ENV TZ=Asia/Shanghai
ENV READER_APP_WEB_ROOT=/app/web-ui/dist
ENV READER_OBSCURA_BIN=/opt/obscura/obscura

COPY --from=builder /out/GoReader /usr/local/bin/GoReader
COPY --from=web /web/dist /app/web-ui/dist

EXPOSE 8080
VOLUME ["/data"]
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["GoReader"]
