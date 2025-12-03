# 第一阶段：构建Vue项目
FROM --platform=$BUILDPLATFORM node:22-alpine AS builder
RUN apk add --no-cache python3 npm git

WORKDIR /

RUN git clone --recurse-submodules https://github.com/Dos7t3r/Vue-mmPlayer.git app

WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖（使用淘宝镜像加速）
RUN npm install
    

# 复制源代码并构建
COPY . .
RUN npm run build

# 第二阶段：生产环境
FROM node:22-alpine AS app 

WORKDIR /app

# 从构建阶段复制打包结果
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/docker-entrypoint.sh /docker-entrypoint.sh
# 复制自定义nginx配置（如有需要）
# COPY nginx.conf /etc/nginx/nginx.conf
RUN apk add --no-cache npm python3 youtube-dl \
    && npm install -g @unblockneteasemusic/server \
    && wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp \
    && chmod +x /usr/local/bin/yt-dlp \
    && chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]













