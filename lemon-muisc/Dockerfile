# syntax=docker/dockerfile:1

# ==============================================================================
# Stage 1: Builder (编译前端与服务端代码)
# 使用 BUILDPLATFORM 避免 QEMU 模拟导致的 Illegal instruction
# ==============================================================================
FROM --platform=$BUILDPLATFORM node:22-alpine AS builder

WORKDIR /app

# 安装编译依赖
RUN apk add --no-cache python3 make g++

# 优先复制包管理文件，利用 Docker 缓存层
COPY package.json package-lock.json ./
# 使用 ci 严格依据 lock 文件安装，确保构建可复现
RUN npm ci

# 复制源码并构建
COPY . .
RUN npm run build

# ==============================================================================
# Stage 2: Prod-Dependencies (生产依赖准备)
# 仅安装纯 JS 依赖，不在此阶段处理原生模块，避免跨架构二进制不兼容
# ==============================================================================
FROM --platform=$BUILDPLATFORM node:22-alpine AS prod-deps

WORKDIR /app

COPY package.json package-lock.json ./

# 配置淘宝镜像加速
ENV npm_config_disturl=https://registry.npmmirror.com/-/binary/node

# 仅安装生产依赖，跳过 devDependencies
# 注意：此时 better-sqlite3 的二进制文件可能不匹配目标架构，稍后会在 Stage 3 重建
RUN npm install --omit=dev --registry=https://registry.npmmirror.com \
    && npm cache clean --force

# ==============================================================================
# Stage 3: Final Runtime (最终运行镜像)
# 关键：在此阶段针对目标架构重建原生模块
# ==============================================================================
FROM node:22-alpine

# 1. 安全优化：创建非 root 用户
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

WORKDIR /app

# 2. 安装运行时必要工具
# tini: 进程初始化系统，处理信号转发
# python3 make g++ sqlite-dev: 用于在目标架构下重新编译 better-sqlite3
# 修正点：Alpine 中 SQLite 开发库包名为 sqlite-dev
RUN apk update && apk add --no-cache tini python3 make g++ sqlite-dev

# 3. 复制生产依赖
COPY --from=prod-deps /app/node_modules ./node_modules

# 4. 复制构建产物
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/scripts ./scripts
COPY package.json ./

# 5. 关键步骤：在目标架构下重新编译原生模块
# 此时 Docker 已在正确的 TARGETARCH 下运行，编译出的 .node 文件完全兼容
ENV npm_config_build_from_source=true
RUN npm rebuild better-sqlite3 \
    && node -e "require('better-sqlite3'); console.log('[OK] better-sqlite3 native module verified')" \
    # 编译完成后立即卸载编译工具链，减小镜像体积
    && apk del python3 make g++ sqlite-dev \
    && rm -rf /tmp/* /var/cache/apk/*

# 6. 设置权限
RUN chown -R appuser:appgroup /app

# 7. 切换到非 root 用户
USER appuser

# 8. 环境变量配置
ENV PORT=7983 \
    DOWNLOAD_PATH=/downloads \
    CONFIG_PATH=/config \
    NODE_ENV=production

EXPOSE 7983

VOLUME ["/music", "/downloads", "/config"]

ENTRYPOINT ["tini", "--"]
CMD ["node", "server/index.js"]
