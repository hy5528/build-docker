# JXTVbox Dockerfile —— 零依赖 Node 服务，多架构（amd64 / arm64）
# 构建：docker build -t jxtvbox .
# 多架构：docker buildx build --platform linux/amd64,linux/arm64 -t jxtvbox .

FROM --platform=$BUILDPLATFORM node:22-alpine

# 时区（EPG 时间显示用 Asia/Shanghai）+ CA 证书（HTTPS 采集源必需）
RUN apk add --no-cache tzdata ca-certificates \
    && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo "Asia/Shanghai" > /etc/timezone

LABEL org.opencontainers.image.title="JXTVbox" \
      org.opencontainers.image.description="聚合搜索播放 + 短剧 + 直播 + 网盘/本地媒体库，适配 Android TV 与手机" \
      org.opencontainers.image.url="https://github.com/haonanren118/jxtvbox" \
      org.opencontainers.image.source="https://github.com/haonanren118/jxtvbox" \
      org.opencontainers.image.licenses="AGPL-3.0-or-later" \
      org.opencontainers.image.base.name="docker.io/library/node:22-alpine"

ENV NODE_ENV=production \
    PORT=8080 \
    HOST=0.0.0.0

WORKDIR /app

# 零依赖：没有 npm install、没有构建步，直接拷贝源码
COPY package.json ./
COPY server.js ./
COPY lib/ ./lib/
COPY routes/ ./routes/
COPY public/ ./public/

# 数据目录：源配置/健康度/密码（建议挂载卷持久化）
RUN mkdir -p /app/data && chown -R node:node /app

USER node

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/healthz" || exit 1

CMD ["node", "server.js"]
