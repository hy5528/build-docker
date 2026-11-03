FROM --platform=$BUILDPLATFORM node:18-alpine

LABEL org.opencontainers.image.title="jiexiang-radio" \
      org.opencontainers.image.description="在线电台聚合播放器：RadioDroid/radio-browser 全球电台 + 自定义多格式订阅源 + 服务端 HLS 重写代理" \
      org.opencontainers.image.source="https://github.com/haonanren118/jiexiang-radio"

ENV PORT=8080 \
    DATA_DIR=/data \
    NODE_ENV=production \
    TZ=Asia/Shanghai

WORKDIR /app

# 零第三方依赖，不需要 npm install
COPY package.json ./
COPY server.js ./
COPY public/ ./public/
COPY presets/ ./presets/

RUN apk add --no-cache ca-certificates tzdata

VOLUME ["/data"]
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||8080)+'/api/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "server.js"]
