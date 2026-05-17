# 第一阶段：构建Vue项目
FROM --platform=$BUILDPLATFORM node:20-alpine AS builder
RUN apk add --no-cache python3 pnpm

WORKDIR /app

# 安装依赖（使用淘宝镜像加速）
RUN pnpm install -y


# 复制源代码并构建
COPY . .
RUN pnpm run build

# 第二阶段：生产环境
FROM nginx:1.29.3-alpine3.22-slim AS app

WORKDIR /app

# 从构建阶段复制打包结果
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制自定义nginx配置（如有需要）
# COPY nginx.conf /etc/nginx/nginx.con



EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]





























