# 第一阶段：构建Vue项目
FROM --platform=$BUILDPLATFORM node:22-alpine AS builder

RUN apk add --no-cache python3 git pnpm


WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖（使用淘宝镜像加速）
RUN npm install
    

# 复制源代码并构建
COPY . .
RUN pnpm dev





EXPOSE 3000

CMD [ "-g", "daemon off;"]


