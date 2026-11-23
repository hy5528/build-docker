
# 只跑 Node，不需要浏览器与 FFmpeg
FROM --platform=$BUILDPLATFORM node:22-alpine

ENV NODE_ENV=production \
    PORT=5178 \
    HOST=0.0.0.0 \
    HG_CACHE_DIR=/app/data/media

WORKDIR /app

# 零依赖：只需要拷源码，没有 npm install
COPY package.json ./
COPY server ./server
COPY public ./public
COPY start.mjs ./

# 缓存目录需要可写（容器里以 node 用户运行）
RUN mkdir -p /app/data/media && chown -R node:node /app

EXPOSE 5178

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||5178)+'/api/health').then(r=>r.json()).then(j=>process.exit(j.ok?0:1)).catch(()=>process.exit(1))"

USER node

VOLUME ["/app/data"]

CMD ["node", "server/index.js"]
