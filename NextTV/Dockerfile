# 第一阶段：构建Vue项目
FROM --platform=$BUILDPLATFORM node:22-alpine AS base

RUN apk add --no-cache python3 


WORKDIR /app

# 复制package文件
FROM base AS deps
COPY package*.json ./

# 安装依赖（使用淘宝镜像加速）
RUN npm install
    

# 复制源代码并构建
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 第二阶段：生产环境
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -S nextjs -G nodejs


# 从构建器中复制 standalone 输出
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# 从构建器中复制 scripts 目录
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts

# 从构建器中复制 public 和 .next/static 目录
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static


USER nextjs


EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
