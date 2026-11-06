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

# ================= 第二阶段：运行 =================
# 使用 Nginx Alpine 镜像作为生产环境服务器
FROM nginx:alpine

# 可选：删除 Nginx 默认配置，避免冲突
RUN rm /etc/nginx/conf.d/default.conf

# 1. 复制自定义的 Nginx 配置文件（见下文第3步）
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 2. 从构建阶段复制静态资源到 Nginx 默认目录
# 注意：Vite/React 默认输出目录通常是 dist，Create React App 也是 dist 或 build，请根据实际情况修改
COPY --from=builder /app/dist /usr/share/nginx/html

# 3. 暴露端口
EXPOSE 80

# 4. 启动 Nginx（前台运行，防止容器退出）
CMD ["nginx", "-g", "daemon off;"]
