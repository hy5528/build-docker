# build
FROM --platform=$BUILDPLATFORM node:22-alpine AS builder

RUN npm install -g pnpm 
RUN apk add --no-cache python3 make g++
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# 复制package files先，确保依赖版本一致
COPY package.json pnpm-lock.yaml ./

# 验证依赖完整性，如果不匹配则重新安装
RUN pnpm install --frozen-lockfile --offline || pnpm install --frozen-lockfile


# 复制源代码并构建
COPY . .

# 生成生产构建
RUN npm run build 

# 第二阶段：生产环境
FROM nginx:1.29.3-alpine3.22-slim AS app

WORKDIR /app

# 从构建阶段复制打包结果
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制自定义nginx配置（如有需要）
# COPY nginx.conf /etc/nginx/nginx.con



EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
