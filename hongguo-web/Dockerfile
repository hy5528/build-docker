# syntax=docker/dockerfile:1
# trixie 而不是 bookworm：Debian 13 自带 ffmpeg 7.1.x，才有 H.266/VVC 解码器（红果 360P–720P 档），
# bookworm 的 ffmpeg 5.1 没有 VVC 解码，转码那几档会直接失败。
FROM node:22-trixie-slim

# ffmpeg 只用于「VVC 档位服务端转码成 H.264」这一条链路，浏览器自己解不了 VVC。
RUN apt-get update \
 && apt-get install -y --no-install-recommends ffmpeg \
 && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production \
    PORT=8787 \
    HOST=0.0.0.0 \
    DATA_DIR=/app/data \
    FFMPEG_PATH=/usr/bin/ffmpeg

WORKDIR /app

# 用 pnpm + lockfile 安装生产依赖，确保构建可复现（不要退回 npm install，会漂移传递依赖）
COPY server/package.json server/pnpm-lock.yaml ./server/
RUN corepack enable && cd server && pnpm install --prod --frozen-lockfile

# 再拷代码
COPY server ./server
COPY sources ./sources
COPY web ./web

RUN mkdir -p /app/data/sources && chown -R node:node /app
USER node

EXPOSE 8787
VOLUME ["/app/data"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||8787)+'/health').then(function(r){process.exit(r.ok?0:1)}).catch(function(){process.exit(1)})"

CMD ["node", "server/index.mjs"]
