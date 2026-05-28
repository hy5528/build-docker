# 第一阶段：构建Vue项目
FROM --platform=$BUILDPLATFORM node:22-alpine AS builder
RUN apk add --no-cache python3 


WORKDIR /app/chunyu-cms-web


ADD --chmod=755 ./chunyu-cms-web/package.json /package.json
# 安装依赖（使用淘宝镜像加速）
RUN npm install
    

# 复制源代码并构建

RUN npm run build

# 第二阶段：生产环境
FROM nginx:1.29.3-alpine3.22-slim AS app

WORKDIR /app/chunyu-cms-web

# 从构建阶段复制打包结果
COPY --from=builder /app/out/renderer /usr/share/nginx/html

# 复制自定义nginx配置（如有需要）
# COPY nginx.conf /etc/nginx/nginx.con



EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
