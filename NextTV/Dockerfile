# 使用 Node.js LTS 版本 (当前为 22.x，代号 Jod)，它完美支持 linux/arm/v7
# 使用 -slim 变体以减小镜像体积，同时保持 Debian 基础的兼容性
FROM node:22-slim AS base

WORKDIR /app

# --- 依赖安装阶段 ---
FROM base AS deps
# 复制 package.json 和锁文件
COPY package.json package-lock.json* ./
# 如果使用的是 yarn 或 pnpm，请相应调整下面的命令
# 对于 npm:
RUN npm ci --omit=dev
# 如果是 yarn: RUN yarn install --frozen-lockfile
# 如果是 pnpm: RUN pnpm install --frozen-lockfile

# --- 构建阶段 ---
FROM base AS builder
WORKDIR /app

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
# 复制源代码
COPY . .

# 定义外部常量 URL (构建参数)
ARG EXTERNAL_CONSTANTS_URL="https://alist.xiaohanys.top/d/cloudflare/constants.js"

# 下载 constants.js 并验证
# 注意：Node.js 环境中使用 node -e 执行脚本
RUN node -e " \
  const url = process.env.EXTERNAL_CONSTANTS_URL; \
  console.log('Downloading constants from:', url); \
  fetch(url, { redirect: 'follow' }) \
    .then(res => { \
      if (!res.ok) throw new Error(\`Failed to download: \${res.status}\`); \
      return res.text(); \
    }) \
    .then(text => { \
      if (!text.includes('DEFAULT_VIDEO_SOURCES')) { \
        throw new Error('Validation failed: Invalid content'); \
      } \
      const fs = require('fs'); \
      fs.writeFileSync('./lib/constants.js', text); \
      console.log('constants.js saved successfully.'); \
    }) \
    .catch(err => { \
      console.error(err); \
      process.exit(1); \
    }); \
"

# 执行 Next.js 构建
# 确保 next.config.js 中设置了 output: 'standalone'
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- 生产运行阶段 ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

# 创建非 root 用户 (Debian/Ubuntu 系使用 adduser/addgroup)
# UID/GID 1001 是常见约定，避免与宿主机 root (0) 冲突
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --no-log-init -g nodejs nextjs

# 复制公共静态资源
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# 复制 Standalone 输出产物
# .next/standalone 包含 server.js 和精简后的 node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# 复制静态资源 (CSS/JS chunks)
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 切换到非 root 用户
USER nextjs

EXPOSE 3000

# 启动 Node.js 服务器
CMD ["node", "server.js"]
