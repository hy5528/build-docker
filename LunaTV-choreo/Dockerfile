# 第一阶段：在 Alpine 环境下编译 backup2gh (开启 CGO)
FROM golang:1.26-alpine AS builder-bak
# 安装编译 CGO 所需的工具链
RUN apk add --no-cache git gcc musl-dev sqlite-dev

WORKDIR /build
# 克隆仓库
RUN git clone https://github.com/laboratorys/backup2gh.git .

# 开启 CGO 编译
# 这样编译出的二进制文件会链接到 Alpine 的 musl libc
RUN CGO_ENABLED=0 GOOS=linux go build -o backup2gh .

# 第二阶段：获取 lunatv 源码
FROM ghcr.io/hy5528/nexttv66:latest AS lunatv-source

# 第三阶段：最终运行环境
FROM node:22-alpine AS runner

# 安装基础运行依赖（运行开启 CGO 的程序通常需要基础库）
RUN apk add --no-cache curl unzip sqlite ca-certificates tzdata bash

RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo "Asia/Shanghai" > /etc/timezone

RUN addgroup -g 10014 choreo && \
    adduser -u 10014 -G choreo -s /bin/bash -D choreouser

WORKDIR /app

# 从 builder-bak 拷贝针对 musl 编译的 backup2gh
COPY --from=builder-bak --chown=10014:10014 /build/backup2gh /app/backup2gh
# 从源镜像拷贝应用
COPY --from=lunatv-source --chown=10014:10014 /app /app

ENV NODE_ENV=production \
    HOSTNAME=0.0.0.0 \
    PORT=3000 \
    DOCKER_ENV=true \
    SQLITE_PATH=/app/data/tv.db

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh /app/backup2gh

RUN mkdir -p /app/data /app/.next /app/public && \
    chown -R 10014:10014 /app/data /app/.next /app/public

RUN rm -rf /app/public/manifest.json /app/.next/cache && \
    ln -sf /app/data/manifest.json /app/public/manifest.json && \
    ln -sf /app/data/next-cache /app/.next/cache && \
    chown -h 10014:10014 /app/public/manifest.json /app/.next/cache

USER 10014
WORKDIR /app

ENTRYPOINT ["bash", "/app/entrypoint.sh"]
