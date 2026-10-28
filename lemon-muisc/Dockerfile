# syntax=docker/dockerfile:1
# 柠檬音乐 · 自托管 / 服务器 Docker 镜像（与飞牛原生 FPK 独立）
# builder / prod-deps 在 BUILDPLATFORM 执行，避免 arm64 经 QEMU 跑 npm 触发 Illegal instruction

FROM --platform=$BUILDPLATFORM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache python3 make g++ 
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

FROM --platform=$BUILDPLATFORM node:22-alpine AS prod-deps
ARG TARGETARCH
WORKDIR /app
RUN apk add --no-cache python3 make g++ libsqlite3-dev
COPY package.json package-lock.json ./
# 构建时安装生产依赖并重新编译原生模块（sqlite3 6.x）
ENV npm_config_build_from_source=true \
    npm_config_disturl=https://registry.npmmirror.com/-/binary/node
RUN npm install --omit=dev --registry=https://registry.npmmirror.com \
    && npm rebuild sqlite3 \
    && node -e "require('sqlite3'); console.log('[build] sqlite3 校验通过')" \
    && npm cache clean --force

FROM node:22-alpine
WORKDIR /app
RUN apk add --no-cache tini
COPY package.json package-lock.json ./
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/scripts ./scripts

ENV PORT=7983 \
    DOWNLOAD_PATH=/downloads \
    CONFIG_PATH=/config \
    NODE_ENV=production

EXPOSE 7983
VOLUME ["/music", "/downloads", "/config"]

ENTRYPOINT ["tini", "--"]
CMD ["node", "server/index.js"]
