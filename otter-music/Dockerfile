# ==========================
# 阶段 1: 构建应用 (Builder)
# ==========================
# 使用符合 Vite 7 要求的 Node.js LTS 版本 (推荐 20, 22 或 24)
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 lock 文件 (利用 Docker 缓存层，若依赖未变则跳过安装)
COPY package*.json ./

# 安装依赖
# 如果使用 npm:
RUN npm install
# 如果使用 bun:
# RUN npm install -g bun && bun install
# 如果使用 pnpm:
# RUN npm install -g pnpm && pnpm install --frozen-lockfile

# 复制所有源代码
COPY . .

# 执行构建命令，生成 dist 目录
# 确保 vite.config.ts 中的 base 路径配置正确
RUN npm run build

# ==========================
# 阶段 2: 运行应用 (Production)
# ==========================
# 使用轻量级的 Nginx Alpine 镜像
FROM nginx:alpine

# 移除 Nginx 默认配置文件 (可选，建议自定义)
# RUN rm /etc/nginx/conf.d/default.conf

# 将构建阶段的 dist 目录复制到 Nginx 的默认静态资源目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制自定义 Nginx 配置 (解决 SPA 路由刷新 404 问题)
ADD --chmod=755 ./nginx.conf /etc/nginx/conf.d/default.conf

# 暴露 80 端口
EXPOSE 80

# 启动 Nginx (前台运行，防止容器退出)
CMD ["nginx", "-g", "daemon off;"]
