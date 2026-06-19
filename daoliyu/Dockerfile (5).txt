
# Single stage for combining and extracting app parts
FROM alpine as builder
WORKDIR /
COPY app.tar.gz .
# 合并并解压app.part_*文件到/app目录
RUN mkdir -p /app && \
    tar -xzf app.tar.gz -C /app && \
    rm app.tar.gz

# Stage 3: Copy app to final image
FROM node:20-alpine
COPY --from=builder /app /app
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV DOCKER_ENV=true

# 创建非 root 用户
#RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -S nextjs -G nodejs
# 切换到非特权用户
#USER nextjs

EXPOSE 3000

# 使用自定义启动脚本，先预加载配置再启动服务器
CMD ["node", "start.js"]
