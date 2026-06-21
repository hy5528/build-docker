FROM --platform=$BUILDPLATFORM node:22-alpine AS deps
# 启用 corepack 并激活 pnpm（Node20 默认提供 corepack）
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

# skip postinstall
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .

# add .env.example to .env
# RUN [ ! -e ".env" ] && cp .env.example .env || true
# ---- 第 2 阶段：构建项目 ----
FROM --platform=$BUILDPLATFORM node:22-alpine AS builder
# 安装构建工具以编译原生模块

RUN apk add --no-cache python3 make g++ curl
# RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# 复制package files先，确保依赖版本一致
COPY package.json pnpm-lock.yaml ./
# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
# 验证依赖完整性，如果不匹配则重新安装
RUN pnpm install --frozen-lockfile
# 复制全部源代码
COPY . .

# 在构建阶段设置 DOCKER_BUILD，启用 standalone 输出
ENV SKIP_NATIVE_BUILD=true
ENV DOCKER_BUILD=true


# 生成生产构建
RUN pnpm run build

FROM nginx:1.29.3-alpine3.22-slim AS app

WORKDIR /app

# 从构建阶段复制打包结果
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制自定义nginx配置（如有需要）
# COPY nginx.conf /etc/nginx/nginx.con





# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -S nextjs -G nodejs

WORKDIR /app

# 创建视频缓存目录并设置权限
# RUN mkdir -p /app/video-cache && chown -R nextjs:nodejs /app/video-cache
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=80
ENV DOCKER_BUILD=true
# Puppeteer 配置：使用系统安装的 Chromium（已禁用）
# ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
# ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# 从构建器中复制 standalone 输出
# COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./


# 从构建器中复制 scripts 目录
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
# 从构建器中复制 start.js
# COPY --from=builder --chown=nextjs:nodejs /app/start.js ./start.js
# 从构建器中复制 public 和 .next/static 目录
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 切换到非特权用户
USER nextjs

EXPOSE 80



CMD ["nginx", "-g", "daemon off;"]
