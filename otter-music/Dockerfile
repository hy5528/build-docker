# 阶段 1: 构建
FROM --platform=$BUILDPLATFORM node:22-alpine AS builder

WORKDIR /app

# 1. 复制 package 文件
COPY package*.json ./
# 如果有 workspace，也需要复制子项目的 package.json
COPY shared/package*.json ./shared/
COPY functions/package*.json ./functions/

# 2. 

RUN npm npm install 

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
