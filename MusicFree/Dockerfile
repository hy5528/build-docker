# ---- 第 1 阶段：安装依赖 ----
FROM --platform=$BUILDPLATFORM node:20-alpine AS deps

# 启用
RUN apk add --no-cache git python3 make g++

WORKDIR /
RUN git clone https://github.com/algerkong/AlgerMusicPlayer.git app

# 安装所有依赖（含 devDependencies，后续会裁剪）
RUN npm install --frozen-lockfile

# ---- 第 2 阶段：构建项目 ----
FROM --platform=$BUILDPLATFORM node:20-alpine AS builder
WORKDIR /app

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
# 复制全部源代码
COPY . .

# 在构建阶段也显式设置 DOCKER_ENV，
ENV DOCKER_ENV=true

# 生成生产构建
RUN npm run build

CMD ["npx"]
