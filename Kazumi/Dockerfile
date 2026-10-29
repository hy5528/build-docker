# ============================================
# 番剧播放器 Docker 镜像
# 使用外部 C++ CEF Sniffer 服务进行视频解析
# ============================================

# 阶段 1: 依赖安装
FROM node:20-slim AS deps

WORKDIR /app

# 复制 package 文件
COPY package.json package-lock.json* ./

# 安装依赖 (包括 devDependencies 用于构建)
RUN npm ci

# 安装 sharp 用于图片优化
RUN npm install sharp

# ============================================
# 阶段 2: 构建
FROM --platform=$BUILDPLATFORM node:20-slim AS builder

WORKDIR /app

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules

# 复制源代码
COPY . .

# 设置环境变量
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# 构建应用
RUN npm run build

# ============================================
# 阶段 3: 生产运行
FROM node:20-slim AS runner

WORKDIR /app

# 字体支持 (可选，如需中文字体可取消注释)
# RUN apt-get update && apt-get install -y fonts-noto-cjk --no-install-recommends && rm -rf /var/lib/apt/lists/*

# 创建非 root 用户
RUN groupadd --gid 1001 nodejs && \
    useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home nextjs

# 设置运行时环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
# C++ Sniffer 服务地址 (可通过环境变量覆盖)
ENV SNIFFER_SERVICE_URL="http://localhost:9527"

# 复制构建产物
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 安装 sharp (生产环境需要)
COPY --from=deps /app/node_modules/sharp ./node_modules/sharp
COPY --from=deps /app/node_modules/@img ./node_modules/@img

# 切换到非 root 用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD node -e "const http = require('http'); http.get('http://localhost:3000/api/bangumi/calendar', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# 启动命令
CMD ["node", "server.js"]
