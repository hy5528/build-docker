# 第一阶段：构建Vue项目
FROM --platform=$BUILDPLATFORM node:22-alpine AS builder
RUN apk add --no-cache python3 pm2

WORKDIR /app/chunyu-cms-web

# 复制package文件
COPY package*.json ./

# 安装依赖（使用淘宝镜像加速）
RUN npm install
    

# 复制源代码并构建
COPY . .
RUN npm run build

RUN pm2 start pm2.config.cjs

CMD ["-g", "daemon off;"]
