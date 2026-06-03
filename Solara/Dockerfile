# 第一阶段：构建Vue项目
FROM node:22-alpine 

# 安装必要的 CA 证书，避免 HTTPS 请求报 TLS 错误
RUN apk add ca-certificates && rm -rf /var/lib/apt/lists/*


WORKDIR /app

# Keep build context clean and install runtime dependency in-container.
COPY . .
RUN npm install --omit=dev express
RUN mkdir -p /app/downloads

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "server.js"]

