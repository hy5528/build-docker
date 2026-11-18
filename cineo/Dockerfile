# -----------------------------------------------------------------------------
# 阶段 1: 构建阶段 (Build Stage)
# 负责安装 Flutter SDK、获取依赖并编译 Web 产物
# -----------------------------------------------------------------------------
FROM debian:bookworm-slim AS build

# 定义参数，方便 CI/CD 传入版本或环境变量
ARG FLUTTER_VERSION=3.24.0
ARG FLUTTER_SDK=/flutter

# 设置环境变量，将 Flutter 和 Dart bin 目录加入 PATH
ENV PATH="$FLUTTER_SDK/bin:$FLUTTER_SDK/bin/cache/dart-sdk/bin:${PATH}"

# 1. 安装基础依赖
# --no-install-recommends: 不安装推荐包，减小体积
# ca-certificates: 解决 Git HTTPS 克隆时的证书验证失败问题
# curl/git/unzip/xz-utils: Flutter SDK 运行所需
# libglu1-mesa: 某些 Flutter 工具链可能需要的图形库依赖
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        git \
        unzip \
        xz-utils \
        libglu1-mesa \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# 2. 安装 Flutter SDK (利用 Docker 缓存)
# --depth 1: 浅克隆，只拉取最新提交，大幅减少下载量
# --branch: 指定稳定版本
RUN git clone --depth 1 --branch $FLUTTER_VERSION https://github.com/flutter/flutter.git $FLUTTER_SDK

# 3. 配置 Flutter 仅启用 Web 平台并预缓存资源
# 这一步是关键：跳过 Android/iOS/Desktop 组件下载，显著缩短时间
RUN flutter config --enable-web && \
    flutter precache --web && \
    flutter doctor -v

# 4. 设置工作目录并复制代码
WORKDIR /app

# 5. 优化依赖缓存层
# 先只复制 pubspec.yaml 和 pubspec.lock
COPY pubspec.yaml pubspec.lock ./

# 6. 获取依赖
# 如果 pubspec.yaml 未变，Docker 将直接使用缓存层，跳过此步
# 注意：确保 pubspec.yaml中的 path 等依赖版本与 Flutter SDK 兼容
RUN flutter pub get

# 7. 复制剩余源代码
# 代码经常变动，放在最后以避免使上面的依赖层失效
COPY . .

# 8. 构建 Web 应用


RUN flutter build web --release \
    --output=./build/web

# -----------------------------------------------------------------------------
# 阶段 2: 运行阶段 (Runtime Stage)
# 使用 Nginx 提供静态文件服务，极简且高性能
# -----------------------------------------------------------------------------
FROM nginx:1.27-alpine-slim

# 可选：自定义 Nginx 配置以支持 Flutter 路由（History API 模式）
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# 从构建阶段复制编译好的 Web 产物到 Nginx 默认目录
COPY --from=build /app/build/web /usr/share/nginx/html

# 暴露 80 端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
