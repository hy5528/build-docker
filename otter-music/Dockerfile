# ================= 第一阶段：构建 =================
# 使用官方 Node.js LTS 版本的 Alpine 镜像，体积小且兼容性好
FROM --platform=$BUILDPLATFORM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 1. 复制依赖配置文件（利用缓存：只要 package.json 不变，npm install 就不会重新执行）
COPY package*.json ./

# 2. 安装依赖
# 如果是生产环境，建议使用 npm ci --production 或根据项目需求调整
RUN npm install

# 3. 复制所有源代码
COPY . .

# 4. 执行构建命令
# 确保你的 package.json 中定义了 "build": "vite build" 或类似命令
RUN npm run build

# 使用轻量级的 Nginx Alpine 镜像
FROM nginx:alpine

# 移除 Nginx 默认配置文件 (可选，建议自定义)
# RUN rm /etc/nginx/conf.d/default.conf

# 将构建阶段的 dist 目录复制到 Nginx 的默认静态资源目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制自定义 Nginx 配置 (解决 SPA 路由刷新 404 问题)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露 80 端口
EXPOSE 80

# 启动 Nginx (前台运行，防止容器退出)
CMD ["nginx", "-g", "daemon off;"]
