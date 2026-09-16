# ============================== MusicHub 运行镜像 ==============================
# 注意：
#   - 前端为纯静态文件 (无构建步骤)，由 backend 直接 express.static 提供。
#   - data / downloads / playlists 为运行时宿主机挂载目录，禁止 COPY 进镜像。
#   - 后端 Node 依赖在构建时安装进镜像，重启/重建容器不再重新 npm install。
#   - sqlite3 为原生模块，需 gcc/make/python3 编译，构建阶段安装后打包进镜像。
FROM alpine:3.24



# 安装编译原生模块所需的工具（sqlite3 需要 gcc/make/python3）
RUN apk add --no-cache python3 build-base
    

WORKDIR /app


# 先复制依赖清单，利用 Docker 层缓存
# 注意：这里【不复制 package-lock.json】。sqlite3 已升级到 6.x（N-API 重写，支持 Node 22），
# 若保留旧 lock 会把 sqlite3 锁死在 5.1.6（其捆绑的 node-gyp 8.4.1 无法编译 Node 22），导致构建失败。
# 故仅用 package.json 按 ^6.0.1 解析安装，保证始终拉到兼容 Node 22 的版本。
COPY backend/package.json /app/backend/
WORKDIR /app/backend

# 构建时安装生产依赖并重新编译原生模块（sqlite3 6.x），使用国内 npm 镜像加速
# sqlite3 6.x 已用 N-API 重写：install 脚本为「prebuild-install -r napi || node-gyp rebuild」，
# 优先用跨 Node 版本的 N-API 预编译二进制，失败再退回 node-gyp 12 源码编译（node-gyp 12 支持 Node 22，
# 而老版本 5.1.6 捆绑的 node-gyp 8.4.1 不支持 Node 22，正是之前 gyp 失败的根因）。
# 关键配置（适配国内网络、保证构建可复现）：
#   1) npm_config_build_from_source=true —— 让 prebuild-install 跳过 GitHub 预编译下载，直接走 node-gyp 12 源码编译
#   2) npm_config_disturl             —— node-gyp 拉取 Node 头文件走国内镜像，避免连 nodejs.org 失败
#   3) 编译后立刻 require('sqlite3') 校验，加载失败则让镜像构建直接报错（fail-fast），
#      杜绝“镜像构建‘成功’却带着坏的 sqlite3 发出去”的情况。
ENV npm_config_build_from_source=true \
    npm_config_disturl=https://registry.npmmirror.com/-/binary/node
RUN npm install --omit=dev --registry=https://registry.npmmirror.com \
    && npm rebuild sqlite3 \
    && node -e "require('sqlite3'); console.log('[build] sqlite3 校验通过')" \
    && npm cache clean --force

# 复制剩余后端源码
COPY backend/ /app/backend/

# 复制前端静态文件
COPY frontend/ /app/frontend/

# 镜像内启动脚本（根据 PUID/PGID 设置运行用户后启动 node server.js）
RUN printf '%s\n' \
    '#!/bin/bash' \
    'set -e' \
    '' \
    '# 支持 PUID / PGID 自定义运行用户（默认 1000:1000，与 node 镜像内置 node 用户一致）' \
    'PUID=${PUID:-1000}' \
    'PGID=${PGID:-1000}' \
    '' \
    '# 处理组：若目标 gid 不存在则把内置 node 组的 gid 改成 PGID，否则复用已存在的组' \
    'if ! getent group "$PGID" >/dev/null 2>&1; then' \
    '  groupmod -g "$PGID" node 2>/dev/null || groupadd -g "$PGID" appgroup' \
    'fi' \
    'GROUPNAME=$(getent group "$PGID" | cut -d: -f1)' \
    '' \
    '# 处理用户：若目标 uid 不存在则把内置 node 用户的 uid 改成 PUID，否则复用已存在的用户' \
    'if ! getent passwd "$PUID" >/dev/null 2>&1; then' \
    '  usermod -u "$PUID" -g "$GROUPNAME" node 2>/dev/null || useradd -u "$PUID" -g "$GROUPNAME" appuser' \
    'fi' \
    'USERNAME=$(getent passwd "$PUID" | cut -d: -f1)' \
    '' \
    '# 修正挂载目录归属，避免宿主机 UID/GID 与容器内不一致导致无权限' \
    'chown -R "$PUID":"$PGID" /app/data /app/downloads /app/playlists 2>/dev/null || true' \
    '' \
    'cd /app/backend' \
    'exec su "$USERNAME" -c "node server.js"' \
    > /app/start.sh && chmod +x /app/start.sh

# 环境变量
ENV PORT=8000
ENV DATA_DIR=/app/data
ENV PLUGINS_DIR=/app/data/plugins
ENV DOWNLOADS_DIR=/app/downloads
ENV LOGS_DIR=/app/data/logs
ENV PLAYLISTS_DIR=/app/playlists
ENV NODE_ENV=production
ENV PUID=1000
ENV PGID=1000

# 暴露端口
EXPOSE 8000
