# ---- 第 1 阶段：安装依赖 ----
FROM --platform=$BUILDPLATFORM node:21-alpine AS deps

# 启用 corepack 并激活 pnpm（Node20 默认提供 corepack）
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app



# 安装所有依赖（含 devDependencies，后续会裁剪）
RUN pnpm install --frozen-lockfile

# ---- 第 2 阶段：构建项目 ----
FROM --platform=$BUILDPLATFORM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app


# 复制全部源代码
COPY . .


# 生成生产构建
RUN pnpm run build



# 使用自定义启动脚本，先预加载配置再启动服务器
CMD ["node"] 
