# 阶段 1: 构建
FROM --platform=$BUILDPLATFORM node:18-alpine AS builder

RUN apk add --no-cache python3 make g++

WORKDIR /app

# 1. 复制依赖文件
COPY package*.json ./

# 2. 配置国内镜像源并安装依赖
# --no-audit --no-fund 可以显著减少网络请求，提高构建速度和稳定性
RUN npm config set registry https://registry.npmmirror.com \
    && npm ci --legacy-peer-deps --no-audit --no-fund

# 3. 复制所有源代码
COPY . .

# 4. 执行构建
# 如果这里报错，请检查本地 npm run build 是否能通过
RUN npm run build

# 阶段 2: 运行 (Nginx)
FROM nginx:alpine

# 复制自定义 nginx 配置 (可选，但推荐)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# 从构建阶段复制静态资源
# 注意：Vite/React 默认输出目录通常是 dist，Vue CLI 也是 dist
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

