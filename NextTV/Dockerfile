# ---- 第 1 阶段：安装依赖 ----
FROM --platform=$BUILDPLATFORM node:24-alpine AS deps


WORKDIR /app

COPY package.json ./

RUN npm install --frozen-lockfile

# ---- 第 2 阶段：构建项目 ----
FROM --platform=$BUILDPLATFORM node:24-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ---- 第 3 阶段：生成 lite 运行时镜像 ----
FROM nginx:1.29.3-alpine3.22-slim AS app

RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -S nextjs -G nodejs

WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV DOCKER_ENV=true
ENV MOONTV_LITE=true
ENV WATCH_ROOM_ENABLED=false
ENV WATCH_ROOM_SERVER_TYPE=external
ENV OFFLINE_DOWNLOAD_DIR=/data

# 从构建阶段复制打包结果
COPY --from=builder /app/out/renderer /usr/share/nginx/html
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "start.js"]
