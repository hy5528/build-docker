# 使用官方 Node.js 镜像作为基础镜像
FROM node:22-alpine

RUN apk add --no-cache git python3 make g++ curl prettier && \
    rm -rf /var/cache/apk/*
# 设置工作目录
WORKDIR /app

# 安装依赖
RUN yarn  install

# 复制应用程序代码
COPY . .

# 如果需要构建应用（例如 Next.js）
RUN yarn  run build

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "start"]
