# ---- 第 1 阶段：安装依赖 ----
FROM --platform=$BUILDPLATFORM node:20-alpine AS deps

# 启用
RUN apk add --no-cache git python3 make g++ npm
RUN git clone https://github.com/algerkong/AlgerMusicPlayer.git app

WORKDIR /app


# 安装所有依赖（含 devDependencies，后续会裁剪）
RUN npm install 

# ---- 第 2 阶段：构建项目 ----
FROM --platform=$BUILDPLATFORM node:20-alpine AS builder
WORKDIR /app

# 复制全部源代码
COPY . .

# 生成生产构建
RUN npm run build

CMD ["npx"]
