# ---- 第 1 阶段：安装依赖 ----
FROM --platform=$BUILDPLATFORM node:20-alpine AS deps

# 启用 corepack 并激活 pnpm（Node20 默认提供 corepack）
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

RUN \
  echo 'use npm mirror' && \
  npm config set registry https://registry.npmmirror.com && \
  yarn config set registry https://registry.npmmirror.com && \
  pnpm config set registry https://registry.npmmirror.com ;

COPY ["./pnpm-lock.yaml", ".npmrc",  "./pnpm-workspace.yaml", "./package.json", "/app/"]
COPY ./patches /app/patches

RUN pnpm fetch

COPY . /app
RUN pnpm install -r --offline

RUN pnpm run build && pnpm run web:build-b

EXPOSE 8899
CMD ["pnpm", "run", "server"]
