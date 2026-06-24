FROM node:22-slim

WORKDIR /app

# 安装 CA 证书，确保 HTTPS 上游请求正常
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# 全局安装 wrangler（锁定大版本 3.x，避免意外 breaking change）
# 使用 --ignore-scripts 跳过可选的原生依赖编译，加快构建速度
RUN npm install -g wrangler@3 --ignore-scripts

# 复制项目文件（server/node_modules、data、.git 等已由 .dockerignore 排除）
COPY . .

# 创建数据持久化目录（SQLite / D1 本地模拟文件写入此处）
RUN mkdir -p /app/data

# 确保 entrypoint 脚本可执行
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 8787

ENTRYPOINT ["/app/docker-entrypoint.sh"]
