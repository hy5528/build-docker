# 第一阶段：依赖安装与构建
FROM --platform=$BUILDPLATFORM node:20-alpine AS base

# 第二阶段：安装依赖
FROM base AS deps
# 如果使用的是 pnpm 或 yarn，请相应调整
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 复制 package 文件以利用缓存
COPY package.json package-lock.json* ./
RUN npm ci

# 第三阶段：构建应用
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 设置环境变量以触发 standalone 构建（如果在 config 中未硬编码）
ENV NEXT_TELEMETRY_DISABLED 1
ENV BUILD_STANDALONE true

# 执行构建
RUN npm run build

# 第四阶段：生产运行
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# 创建非 root 用户以增强安全性
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制 standalone 输出目录
# 注意：standalone 模式不会自动复制 public 和 static 文件，需要手动复制
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# 启动服务器
CMD ["node", "server.js"]




