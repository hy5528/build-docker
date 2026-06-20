# build
FROM --platform=$BUILDPLATFORM node:22-alpine AS base

# install pnpm
FROM base AS deps
RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# skip postinstall
RUN pnpm install --frozen-lockfile --ignore-scripts


    

# 复制源代码并构建
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# 启用 corepack 并激活 pnpm（Node20 默认提供 corepack）
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm run build

# 第二阶段：生产环境
FROM nginx:1.29.3-alpine3.22-slim AS app

WORKDIR /app

COPY --from=builder /app/dist /usr/share/nginx/html


EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
