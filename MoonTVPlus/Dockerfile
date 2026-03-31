# ---- 第 1 阶段：安装依赖 ----
FROM --platform=$BUILDPLATFORM node:24-alpine AS deps

# 启用 corepack 并激活 pnpm（Node20 默认提供 corepack）
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 仅复制依赖清单，提高构建缓存利用率
COPY package.json pnpm-lock.yaml ./

# 安装所有依赖（含 devDependencies，后续会裁剪）
RUN pnpm install --frozen-lockfile

# ---- 第 2 阶段：构建项目 ----
FROM --platform=$BUILDPLATFORM node:24-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
# 复制全部源代码
COPY . .

# 在构建阶段也显式设置 DOCKER_ENV，
ENV DOCKER_ENV=true

# 生成生产构建
RUN pnpm run build

# 使用 pnpm deploy 提取生产依赖到独立目录
RUN pnpm deploy --filter=. --prod --legacy /tmp/prod-deps

# ---- 第 1 阶段：安装依赖 ----
FROM node:24-alpine AS deps

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

# ---- 第 2 阶段：构建项目 ----
FROM node:24-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV DOCKER_ENV=true
ENV MOONTV_LITE=true
ENV WATCH_ROOM_ENABLED=false
ENV WATCH_ROOM_SERVER_TYPE=external

RUN pnpm run build

# ---- 第 3 阶段：生成 lite 运行时镜像 ----
FROM node:24-alpine AS runner

RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -S nextjs -G nodejs

WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV DOCKER_ENV=true
ENV MOONTV_LITE=true
ENV WATCH_ROOM_ENABLED=false
ENV WATCH_ROOM_SERVER_TYPE=external

# standalone 输出自带运行所需的最小服务端依赖
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
COPY --from=builder --chown=nextjs:nodejs /app/start.js ./start.js
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "start.js"]
