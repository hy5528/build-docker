FROM --platform=$BUILDPLATFORM node:20-alpine

# 1. 安装系统依赖
# Alpine 使用 apk 包管理器
# --no-cache: 不保留缓存索引，减小镜像体积
# ffmpeg: 视频处理核心
# curl: 用于更轻量的健康检查 (可选，若坚持用 node fetch 可不装)
RUN apk update \
 && apk add --no-cache \
    ffmpeg \
    curl \
 && rm -rf /var/cache/apk/*

# 验证 FFmpeg 是否支持所需编解码器 (构建时检查，失败则停止构建)
# 注意：Alpine 的 ffmpeg 可能默认不包含某些专有 codec，需根据实际测试调整
RUN ffmpeg -version > /dev/null 2>&1

ENV NODE_ENV=production \
    PORT=8787 \
    HOST=0.0.0.0 \
    DATA_DIR=/app/data \
    FFMPEG_PATH=/usr/bin/ffmpeg

WORKDIR /app

# 2. 安装生产依赖
# 确保 .dockerignore 中排除了 node_modules
COPY server/package.json server/pnpm-lock.yaml ./server/
RUN corepack enable \
 && cd server \
 && pnpm install --prod --frozen-lockfile

# 3. 复制源代码
COPY server ./server
COPY sources ./sources
COPY web ./web

# 4. 权限设置
# Alpine 中 node 用户通常已存在，UID 1000
# 创建数据目录并赋予权限
RUN mkdir -p /app/data/sources \
 && chown -R node:node /app

# 5. 切换非 root 用户
USER node

EXPOSE 8787

VOLUME ["/app/data"]

# 6. 健康检查
# 方案 A: 使用 curl (推荐，Alpine 中 curl 很轻量)
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -f http://localhost:8787/health || exit 1

# 方案 B: 如果未安装 curl，使用 Node.js fetch (需确保 Node 20 在 Alpine 中工作正常)
# HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
#   CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||8787)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server/index.mjs"]

