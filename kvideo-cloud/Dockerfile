# -------------------------
# 阶段 1: 构建阶段
# -------------------------
FROM --platform=$BUILDPLATFORM node:22-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
# 使用 npm ci 确保严格安装 package-lock.json 中的版本
RUN npm ci

# 复制源代码
COPY . .

# 执行构建
# 对应 scripts 中的 "build": "vite build"
RUN npm run build

# -------------------------
# 阶段 2: 生产服务阶段 (Nginx)
# -------------------------
FROM nginx:alpine-slim

# 复制构建产物到 Nginx 默认目录
# Vite 默认输出目录为 dist/
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制自定义 Nginx 配置 (可选，用于处理 SPA 路由)
# 如果没有 custom.conf，可以注释掉下一行，使用默认配置
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
