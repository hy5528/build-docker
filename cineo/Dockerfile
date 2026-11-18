# -----------------------------------------------------------------------------
# 阶段 1: 构建阶段 (Build Stage)
# -----------------------------------------------------------------------------
FROM debian:bookworm-slim AS build

# 定义参数
ARG FLUTTER_VERSION=3.24.0
ARG FLUTTER_SDK=/flutter

# 设置环境变量
ENV PATH="$FLUTTER_SDK/bin:$FLUTTER_SDK/bin/cache/dart-sdk/bin:${PATH}"

# 1. 安装基础依赖
# 【关键修复】添加 ca-certificates 以支持 HTTPS Git 克隆
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        git \
        unzip \
        xz-utils \
        libglu1-mesa \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# 2. 安装 Flutter SDK
RUN git clone --depth 1 --branch $FLUTTER_VERSION https://github.com/flutter/flutter.git $FLUTTER_SDK && \
    flutter config --enable-web && \
    flutter precache --web && \
    flutter doctor -v

# 3. 设置工作目录
WORKDIR /app

# 4. 复制依赖配置文件
COPY pubspec.yaml pubspec.lock ./

# 5. 获取依赖
# 【关键修复】如果存在 path 版本冲突，在此处先执行升级命令或确保 pubspec.yaml 已修正
# 注意：如果本地 pubspec.yaml 已经修复了 path:^1.9.0，则直接 get 即可
RUN flutter pub get

# 6. 复制剩余源代码
# 【关键修复】确保 .env 或 config.json 被复制进来
# 请检查项目根目录的 .dockerignore，确保没有忽略你的配置文件
# 如果使用 .env，请确保 .dockerignore 中有 !.env
# 如果使用 config.json，请确保 .dockerignore 中有 !config.json
COPY . .

# 7. 构建 Web 应用
# 【关键修复】
# 选项 A: 使用 JSON 配置文件 (推荐，更稳定)
# RUN flutter build web --release --dart-define-from-file=config.json --output=./build/web

# 选项 B: 使用 .env 文件 (需确保格式正确且被复制)
# 注意：Flutter 的 --dart-define-from-file 实际上期望的是 JSON 格式。
# 如果你坚持用 .env 格式的文本文件，Flutter 可能无法直接解析。
# 建议将 .env 转换为 config.json，或者使用多个 --dart-define 参数。
# 这里假设你已经将配置转换为了 config.json 格式：
RUN flutter build web --release \
    --dart-define-from-file=config.json \
    --output=./build/web

# -----------------------------------------------------------------------------
# 阶段 2: 运行阶段 (Runtime Stage)
# -----------------------------------------------------------------------------
FROM nginx:1.27-alpine-slim

# 可选：自定义 Nginx 配置以支持 Flutter 路由（SPA 回退）
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# 从构建阶段复制编译好的 Web 产物
COPY --from=build /app/build/web /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
