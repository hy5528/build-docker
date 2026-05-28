# 第一阶段：构建Vue项目
FROM --platform=$BUILDPLATFORM node:22-alpine AS builder

WORKDIR /app

# 复制package文件
COPY package.json ./

COPY /chunyu-cms-web/package.json ./chunyu-cms-web

# 安装依赖（使用淘宝镜像加速）
RUN npm install
    
WORKDIR /app
# 复制源代码并构建
COPY /chunyu-cms-web ./chunyu-cms-web
WORKDIR /app/chunyu-cms-web
RUN npm run build


# 第二阶段：生产环境
FROM nginx:1.29.3-alpine3.22-slim AS app

WORKDIR /app

# 从构建阶段复制打包结果
COPY --from=builder /app/chunyu-cms-web/dist /usr/share/nginx/html

# 复制自定义nginx配置（如有需要）
# COPY nginx.conf /etc/nginx/nginx.con



EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
