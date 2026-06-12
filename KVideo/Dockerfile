# ---- 第 1 阶段：安装依赖 ----
FROM --platform=$BUILDPLATFORM node:22-alpine AS deps

# 启用 corepack 并激活 pnpm（Node20 默认提供 corepack）
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app


# 仅复制依赖清单，提高构建缓存利用率
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./

# 清理任何潜在的缓存并安装所有依赖（包括可选的原生模块）
RUN npm install 

# ---- 第 2 阶段：构建项目 ----
FROM --platform=$BUILDPLATFORM node:22-alpine AS builder
# 安装构建工具以编译原生模块
RUN apk add --no-cache python3 make g++

WORKDIR /app

# 复制package files先，确保依赖版本一致
COPY package.json package-lock.json* ./
# 复制依赖
COPY --from=deps /app/node_modules ./node_modules

# 复制全部源代码
COPY . .

# 在构建阶段设置 DOCKER_BUILD，启用 standalone 输出
ENV DOCKER_BUILD=true

# 生成生产构建
RUN npm run build

# ---- 第 3 阶段：生成运行时镜像 ----
FROM node:22-alpine AS runner

# 安装 CA 证书以支持 HTTPS 请求
RUN apk add --no-cache ca-certificates \
    && rm -rf /var/cache/apk/* \
    && rm -rf /tmp/*

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -S nextjs -G nodejs

WORKDIR /app

# 创建视频缓存目录并设置权限
RUN mkdir -p /app/video-cache && chown -R nextjs:nodejs /app/video-cache
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV DOCKER_BUILD=true
# Puppeteer 配置：使用系统安装的 Chromium（已禁用）
# ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
# ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV SUBSCRIPTION_SOURCES='https://gh-proxy.org/https://github.com/hy5528/build-docker/blob/main/KVideo/config.json'
ENV IPTV_SOURCES='[{"name":"咪咕直播","url":"https://proxy.api.030101.xyz/develop202.github.io/migu_video/interface.txt"},{"name":"广西移动","url":"https://gh-proxy.org/https://github.com/Healer-sys/Home/blob/main/iptv/gx.m3u"}]'

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 切换到非特权用户
USER nextjs

EXPOSE 3000

# 使用自定义启动脚本，先预加载配置再启动服务器
CMD ["node", "server.js"]
