# 使用 Node.js 官方 LTS 版本的 Alpine 镜像作为基础
# Alpine 体积小，适合生产环境
FROM node:22-alpine AS base

WORKDIR /app

# -------------------------
# 阶段 1: 安装依赖
# -------------------------
FROM base AS deps
# Alpine 需要 libc6-compat 以兼容某些原生模块（如 sharp, canvas 等）
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* ./
# 使用 npm ci 确保严格遵循 lock 文件，提高构建一致性
RUN npm ci

# -------------------------
# 阶段 2: 构建应用
# -------------------------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 禁用遥测数据收集
ENV NEXT_TELEMETRY_DISABLED=1

# 执行构建
# 注意：确保 next.config.js 中设置了 output: 'standalone'
RUN npm run build

# -------------------------
# 阶段 3: 生产运行
# -------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

# Node.js 官方镜像默认包含 'node' 用户和组
# 无需手动创建用户，直接使用即可
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nextjs

# 复制公共静态资源
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# 复制 Standalone 输出产物
# Standalone 模式会自动生成一个精简的 node_modules 和 server.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 切换到非 root 用户运行，提高安全性
USER nextjs

EXPOSE 3000

# 设置主机名为 0.0.0.0 以允许外部访问
ENV HOSTNAME="0.0.0.0"

# 启动 Next.js 独立服务器
CMD ["node", "server.js"]
