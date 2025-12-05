# 第一阶段：构建Vue项目
FROM --platform=$BUILDPLATFORM node:22-alpine AS builder
RUN apk add --no-cache python3 npm git 

WORKDIR /

RUN git clone --recurse-submodules https://github.com/chen-ziwen/chiko-music.git app

WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖（使用淘宝镜像加速）
RUN npm install
    

# 复制源代码并构建
COPY . .
RUN npm run build

# 第二阶段：生产环境
FROM nginx:1.29.3-alpine3.22-slim AS app

WORKDIR /app

# 从构建阶段复制打包结果
COPY --from=build /app/docker/nginx.conf.example /etc/nginx/http.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

ADD --chmod=755 ./docker-entrypoint.sh /docker-entrypoint.sh
EXPOSE 80 3000


CMD ["sh", "-c", "nginx && exec npx @neteasecloudmusicapienhanced/api"]
