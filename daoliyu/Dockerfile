# 第一阶段：获取 daoliyu 源码
FROM msmkls/daoliyu-music:latest 
FROM --platform=$BUILDPLATFORM node:22-alpine AS builder
WORKDIR /app
# 生成生产构建
RUN pnpm run build

# Stage 3
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=4000
ENV DOCKER_ENV=true

# 创建非 root 用户
#RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -S nextjs -G nodejs
# 切换到非特权用户
#USER nextjs

EXPOSE 3000

# 使用自定义启动脚本，先预加载配置再启动服务器
CMD ["node", "start.js"]
