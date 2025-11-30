# 第一阶段：构建Vue项目
FROM --platform=$BUILDPLATFORM node:16-alpine AS builder

WORKDIR /app

# 复制package文件
COPY package*.json ./
RUN echo 'VITE_API_BASE_URL= /api' > .env
# 安装依赖（使用淘宝镜像加速）
RUN npm config set registry https://registry.npmmirror.com/ && \
    npm install

# 复制源代码并构建
COPY . .
RUN npm run build

# 第二阶段：生产环境
FROM nginx:alpine

# 从构建阶段复制打包结果
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制自定义nginx配置（如有需要）
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
