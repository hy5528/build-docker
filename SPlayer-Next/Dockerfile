# build
FROM --platform=$BUILDPLATFORM node:22-alpine AS builder
RUN apk add --no-cache python3 


# 启用 corepack 并激活 pnpm（Node20 默认提供 corepack）
RUN corepack enable && corepack prepare pnpm@latest --activate

# install pnpm
# RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# skip postinstall
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .

RUN apk add --no-cache python3 make g++
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app


# skip native build for web deployment
ENV SKIP_NATIVE_BUILD=true
RUN pnpm build

# 第二阶段：生产环境
FROM nginx:1.29.3-alpine3.22-slim AS app

WORKDIR /app
COPY --from=builder /app/out/renderer /app/out/renderer
# COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/out/renderer /usr/share/nginx/html
EXPOSE 80


CMD ["nginx", "-g", "daemon off;"]

