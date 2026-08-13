FROM --platform=$BUILDPLATFORM node:22-alpine AS deps
# 启用 corepack 并激活 pnpm（Node20 默认提供 corepack）
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

# skip postinstall
RUN pnpm install 

COPY . .

# add .env.example to .env
# RUN [ ! -e ".env" ] && cp .env.example .env || true
# ---- 第 2 阶段：构建项目 ----
FROM --platform=$BUILDPLATFORM node:22-alpine AS builder
# 安装构建工具以编译原生模块

RUN apk add --no-cache python3 make g++ curl
# RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# 复制package files先，确保依赖版本一致
COPY package.json pnpm-lock.yaml ./
# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
# 验证依赖完整性，如果不匹配则重新安装
RUN pnpm install 
# 复制全部源代码
COPY . .

# 在构建阶段设置 DOCKER_BUILD，启用 standalone 输出
ENV SKIP_NATIVE_BUILD=true



# 生成生产构建
RUN pnpm run build

# 第二阶段：生产环境
FROM nginx:1.29.3-alpine3.22-slim AS app

WORKDIR /app

# 从构建阶段复制打包结果
COPY --from=builder /app/out/renderer /usr/share/nginx/html

# 复制自定义nginx配置（如有需要）
# COPY nginx.conf /etc/nginx/nginx.con



EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
