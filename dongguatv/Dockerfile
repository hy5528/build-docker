# 多架构支持: linux/amd64, linux/arm64, linux/arm/v7
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# 安装构建依赖 (better-sqlite3 需要原生编译)
# 注意: ARM 架构会自动使用对应的编译工具链
RUN apk add --no-cache --virtual .build-deps \
    python3 \
    make \
    g++ \
    && npm install --production \
    && apk del .build-deps

COPY . .

# 创建必要的目录
RUN mkdir -p /app/public/cache/images

EXPOSE 3000

CMD ["node", "server.js"]
