# Stage 1: Base image with all runtimes
FROM debian:11-slim AS base
ENV DEBIAN_FRONTEND=noninteractive
RUN sudo apt-get update
RUN sudo apt-get install -y rpm fakeroot snapd
RUN sudo snap install snapcraft --classic
RUN sudo apt-get install -y yarn libnss3-dev libgtk-3-dev libxss-dev libgconf-2-4 libasound2 \
    python3 python3-pip \
    nginx \
    supervisor \
    curl \
    && \
    # Install Node.js v22 from NodeSource
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    # Clean up
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN yarn install --frozen-lockfile 



# 复制全部源代码
COPY . .


# 生成生产构建
RUN yarn run build



# 使用自定义启动脚本，先预加载配置再启动服务器
CMD ["node"] 
