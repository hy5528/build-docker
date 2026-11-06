# 阶段 1: 构建
FROM --platform=$BUILDPLATFORM node:22-alpine AS builder

WORKDIR /app

# 1. 复制 package 文件
COPY package*.json ./
# 如果有 workspace，也需要复制子项目的 package.json
COPY shared/package*.json ./shared/
COPY functions/package*.json ./functions/

# 2. 【关键】设置镜像源并安装依赖
# --registry: 使用国内高速镜像
# --no-audit --no-fund: 跳过安全检查和控制台广告，显著减少网络请求和耗时
RUN npm config set registry https://registry.npmmirror.com \
    && npm ci --no-audit --no-fund

# 3. 复制源代码
COPY . .

# 4. 执行构建
RUN npm run build

# 阶段 2: 运行 (Nginx)
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
