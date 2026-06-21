# build
FROM --platform=$BUILDPLATFORM node:22-alpine AS builder
RUN apk add --no-cache npm python3
# install pnpm
# RUN npm install -g pnpm
# 启用 corepack 并激活 pnpm（Node20 默认提供 corepack）
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

# skip postinstall
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .

# add .env.example to .env
# RUN [ ! -e ".env" ] && cp .env.example .env || true
# ---- 第 2 阶段：构建项目 ----
FROM --platform=$BUILDPLATFORM node:22-alpine AS builder
# 安装构建工具以编译原生模块
RUN apk add --no-cache python3 make g++
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# 复制package files先，确保依赖版本一致
# COPY package.json pnpm-lock.yaml ./
# 复制依赖
# COPY --from=deps /app/node_modules ./node_modules
# 验证依赖完整性，如果不匹配则重新安装
# RUN pnpm install --frozen-lockfile --offline || pnpm install --frozen-lockfile
# 复制全部源代码
COPY . .

# 在构建阶段设置 DOCKER_BUILD，启用 standalone 输出
ENV SKIP_NATIVE_BUILD=true

# 生成生产构建
RUN pnpm run build


# nginx
FROM nginx-alpine
COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/out/renderer /usr/share/nginx/html


ENV NODE_TLS_REJECT_UNAUTHORIZED=0

CMD ["nginx", "-g", "daemon off;"]
