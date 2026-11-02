FROM --platform=$BUILDPLATFORM node:22-alpine

ENV NODE_ENV=production \
    PORT=80 \
    # 数据目录：config.json 与 uploads 默认放这里
    # Docker 部署请将宿主目录挂载到 /app/data（保持可写、可持久化）
    NAVI_CONFIG_PATH=/app/data/config.json \
    NAVI_UPLOAD_DIR=/app/data/uploads

WORKDIR /app

COPY server.js ./

# 服务发现模块（自动识别容器 / 本机端口 + 服务指纹与图标匹配）
COPY discovery.js ./

# 含图片的 zip 备份：手写 ZIP 读写（零依赖）
COPY zip.js ./

# 首页状态板：CPU / 内存 / 磁盘 / 容器统计（全部可降级）
COPY status.js ./

# 复制前端资源，但排除真实的本地 config.json 与 uploads（已在 .dockerignore 排除）
COPY public/ ./public/

# 构建数据目录与占位示例配置：
# - 未挂载 /app/data 时（本地运行/开发）可直接使用内置示例；
# - Docker 整目录挂载 -v ./data:/app/data 时，此示例被宿主文件覆盖。
# - 清理：避免镜像内同时存在会误导的 public/config.json
RUN mkdir -p /app/data/uploads \
    && cp public/config.example.json /app/data/config.json \
    && rm -f public/config.json

# 数据目录必须可写（挂载可写卷；若用只读挂载需自行处理）
VOLUME ["/app/data"]

EXPOSE 80

CMD ["node", "server.js"]
