# ============================== MusicHub 运行镜像 (Alpine版) ==============================
FROM --platform=$BUILDPLATFORM node:22-alpine

# 1. 安装编译原生模块所需的工具
# Alpine 使用 apk 包管理器。
# python3, make, g++ 是 node-gyp 编译 sqlite3 所必需的。
# musl-dev 是 musl libc 的开发头文件，缺少它会导致编译链接失败。
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    musl-dev \
    bash \
    shadow \
    su-exec

# 设置工作目录
WORKDIR /app

# 2. 创建运行时目录并设置权限
# Alpine 中通常没有预置 uid 1000 的 node 用户，我们需要稍后在启动脚本中处理，
# 或者在这里先创建好。为了保持与原逻辑一致（动态 PUID/PGID），
# 我们先创建目录，启动时再修正归属。
RUN mkdir -p /app/data/plugins /app/data/uploads /app/data/cache /app/data/logs /app/downloads \
    && chmod -R 777 /app/data /app/downloads

# 3. 复制依赖清单
COPY backend/package.json /app/backend/
WORKDIR /app/backend

# 4. 安装依赖并编译原生模块
# 关键配置：
# npm_config_build_from_source=true : 强制忽略预编译二进制，因为 Alpine (musl) 与大多数预编译的 glibc 二进制不兼容。
# npm_config_python=/usr/bin/python3 : 指定 python3 路径，避免 node-gyp 找不到 python。
ENV npm_config_build_from_source=true
ENV npm_config_python=/usr/bin/python3

RUN npm install --omit=dev \
    && npm rebuild sqlite3 \
    && node -e "require('sqlite3'); console.log('[build] sqlite3 校验通过')" \
    && npm cache clean --force

# 5. 复制剩余后端源码
COPY backend/ /app/backend/

# 6. 复制前端静态文件
COPY frontend/ /app/frontend/

# 7. 创建启动脚本
# Alpine 默认没有 usermod/groupmod 的某些行为差异，且没有内置 node 用户。
# 这里使用更通用的方式：如果 PUID/PGID 不是 root，则创建对应用户/组，并使用 su-exec 或 su 切换。
RUN printf '%s\n' \
    '#!/bin/bash' \
    'set -e' \
    '' \
    'PUID=${PUID:-1000}' \
    'PGID=${PGID:-1000}' \
    '' \
    '# 如果以 root 运行但指定了非 root ID，则创建用户' \
    'if [ "$PUID" != "0" ]; then' \
    '  # 检查组是否存在，不存在则创建' \
    '  if ! getent group "$PGID" >/dev/null 2>&1; then' \
    '    addgroup -g "$PGID" appgroup' \
    '  fi' \
    '  GROUPNAME=$(getent group "$PGID" | cut -d: -f1)' \
    '' \
    '  # 检查用户是否存在，不存在则创建' \
    '  if ! getent passwd "$PUID" >/dev/null 2>&1; then' \
    '    adduser -u "$PUID" -G "$GROUPNAME" -D appuser' \
    '  fi' \
    '  USERNAME=$(getent passwd "$PUID" | cut -d: -f1)' \
    '' \
    '  # 修正目录权限' \
    '  chown -R "$PUID":"$PGID" /app/data /app/downloads 2>/dev/null || true' \
    '' \
    '  # 使用 su-exec 或 su 执行 (Alpine 推荐 su-exec，若未安装则用 su)' \
    '  if command -v su-exec >/dev/null 2>&1; then' \
    '    exec su-exec "$USERNAME" node /app/backend/server.js' \
    '  else' \
    '    exec su "$USERNAME" -c "node /app/backend/server.js"' \
    '  fi' \
    'else' \
    '  # 如果 PUID=0，直接以 root 运行' \
    '  exec node /app/backend/server.js' \
    'fi' \
    > /app/start.sh && chmod +x /app/start.sh

# 环境变量
ENV PORT=8000
ENV DATA_DIR=/app/data
ENV PLUGINS_DIR=/app/data/plugins
ENV DOWNLOADS_DIR=/app/downloads
ENV LOGS_DIR=/app/data/logs
ENV NODE_ENV=production
ENV PUID=1000
ENV PGID=1000

EXPOSE 8000

CMD ["bash", "/app/start.sh"]
