# 第一阶段：构建Vue项目
FROM --platform=$BUILDPLATFORM node:22 AS builder

WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖（使用淘宝镜像加速）
RUN npm ci
    

# 复制源代码并构建
COPY . .
RUN npm run lint
RUN npm run build



EXPOSE 80

CMD ["node", "index.js"]
