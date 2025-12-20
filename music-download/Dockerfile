FROM --platform=$BUILDPLATFORM node:20-alpine AS builder

RUN apk update && apk add --no-cache git npm

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# ---- 第 3 阶段：生成运行时镜像 ----
FROM node:20-alpine AS runner




WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV DOCKER_ENV=true

# 从构建器中复制 standalone 输出
COPY --from=builder /app/.next/standalone ./
# 从构建器中复制 scripts 目录
COPY --from=builder /app/scripts ./scripts

# 从构建器中复制 public 和 .next/static 目录
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# 切换到非特权用户
USER nextjs

EXPOSE 3000

# 使用自定义启动脚本，先预加载配置再启动服务器
CMD ["node", "start.js"] 
