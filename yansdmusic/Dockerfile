# 第一阶段：构建Vue项目
FROM --platform=$BUILDPLATFORM node:22-alpine AS builder
# 安装 wget 用于健康检查
RUN apk add --no-cache wget

# 设置时区
ENV TZ=Asia/Shanghai

WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖（使用淘宝镜像加速）
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


# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/health || exit 1

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
