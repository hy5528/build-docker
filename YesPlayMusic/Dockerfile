
# 构建阶段
FROM node:21-alpine AS builder
RUN apk add --no-cache python3 git
# 设置工作目录
WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN yarn install

# 复制源代码
COPY . .

# 构建项目
RUN yarn run build

# 生产阶段
FROM nginx:alpine

# 复制构建好的文件到nginx目录
COPY --from=builder /app/dist /usr/share/nginx/html


# 暴露端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]
