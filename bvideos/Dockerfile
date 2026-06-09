# --- Stage 1: Builder (构建阶段) ---
# 使用官方 Node.js 18 Alpine 镜像作为基础
FROM node:22-alpine AS builder



# 安装构建依赖 (关键步骤)
# python3, make, g++ 是编译原生 Node.js 模块所必需的
# 这解决了 ARM64 架构下缺少预编译二进制文件导致 npm install 失败的问题
RUN apk add --no-cache libc6-compat python3 make g++


WORKDIR /app

# 复制package文件
COPY package.json package-lock.json ./

# 安装依赖（使用淘宝镜像加速）
RUN npm install -D vite@^8.0.0
RUN npm install
    

# 复制源代码并构建
COPY . .

RUN npm run build

# 第二阶段：生产环境
FROM nginx:1.29.3-alpine3.22-slim AS app

WORKDIR /app

# 从构建阶段复制打包结果
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制自定义nginx配置（如有需要）
# COPY nginx.conf /etc/nginx/nginx.con



EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]











