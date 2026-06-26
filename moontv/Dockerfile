# ---- 第 1 阶段：安装依赖 ----
FROM node:20-bookworm-slim AS deps

ARG PNPM_VERSION=10.14.0

# better-sqlite3 等原生 addon 需要 node-gyp 编译工具链
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

# 固定 corepack 缓存目录，便于跨阶段复用
ENV COREPACK_HOME=/corepack

# corepack 拉取 pnpm 版本时偶发被 npmjs 403；这里显式指定 registry 并加重试
ENV COREPACK_NPM_REGISTRY=https://registry.npmmirror.com

# 启用 corepack 并激活 pnpm（版本与 package.json packageManager 字段一致）
RUN corepack enable \
  && for i in 1 2 3 4 5; do \
       corepack prepare "pnpm@${PNPM_VERSION}" --activate && break; \
       echo "corepack prepare pnpm retry #$i" >&2; \
       sleep $((i * 2)); \
     done \
  && pnpm -v

WORKDIR /app

# Docker build 环境不需要安装 git hooks；避免 husky 在无 .git / 无 git 时失败
ENV HUSKY=0

# 仅复制依赖清单，提高构建缓存利用率
COPY package.json pnpm-lock.yaml ./

# 安装所有依赖（含 devDependencies，后续会裁剪）
# npmjs.org 对 CI runner IP 偶发 403，使用镜像源规避
RUN pnpm config set registry https://registry.npmmirror.com \
  && pnpm install --frozen-lockfile

# ---- 第 2 阶段：构建项目 ----
FROM node:20-bookworm-slim AS builder
ARG PNPM_VERSION=10.14.0
ENV COREPACK_HOME=/corepack
ENV COREPACK_NPM_REGISTRY=https://registry.npmmirror.com

# 复用 deps 阶段已下载的 pnpm
COPY --from=deps /corepack /corepack

RUN corepack enable \
  && for i in 1 2 3 4 5; do \
       corepack prepare "pnpm@${PNPM_VERSION}" --activate && break; \
       echo "corepack prepare pnpm retry #$i" >&2; \
       sleep $((i * 2)); \
     done \
  && pnpm -v
WORKDIR /app

ENV HUSKY=0
ENV SQLITE_BUSY_TIMEOUT_MS=20000

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
# 复制全部源代码
COPY . .

# 在构建阶段也显式设置 DOCKER_ENV，
ENV DOCKER_ENV=true

# 生成生产构建
RUN pnpm run build

# ---- 第 3 阶段：生成运行时镜像 ----
FROM node:20-bookworm-slim AS runner

# 创建非 root 用户
RUN groupadd --gid 1001 nodejs && useradd --uid 1001 --gid nodejs --create-home --shell /usr/sbin/nologin nextjs
RUN mkdir -p /data && chown -R nextjs:nodejs /data

WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV DOCKER_ENV=true
ENV LOCAL_DB_PATH=/data/icetv-data.sqlite

# 从构建器中复制 standalone 输出
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# 从构建器中复制 scripts 目录
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
# 从构建器中复制 start.js
COPY --from=builder --chown=nextjs:nodejs /app/start.js ./start.js
# 从构建器中复制 public 和 .next/static 目录
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 切换到非特权用户
USER nextjs

EXPOSE 3000
VOLUME ["/data"]

# 使用自定义启动脚本，先预加载配置再启动服务器
CMD ["node", "start.js"] 
