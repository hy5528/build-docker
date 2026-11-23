
# 只跑 Node，不需要浏览器与 FFmpeg
FROM --platform=$BUILDPLATFORM node:22-alpine

# 安装 FFmpeg 及其 HEVC 解码依赖
# libva-intel-driver: 如果需要 Intel 核显硬件加速 (VAAPI)
# intel-media-driver: 较新 Intel CPU 所需的驱动 (QSV)
RUN apk add --no-cache \
    ffmpeg \
    libva \
    supervisor \
    python3 \
    libva-intel-driver \
    intel-media-driver \
    v4l-utils

# 验证安装
RUN ffmpeg -decoders | grep hevc


# 设置工作目录

WORKDIR /app

# 复制项目文件

COPY server ./server
COPY webapp ./webapp

# 安装依赖

RUN cd server && npm ci --production && \
    cd ../webapp && npm ci --production

# 创建日志目录

RUN mkdir -p /var/log/supervisor

# 复制 supervisor 配置文件

COPY supervisord.conf /etc/supervisord.conf

# 暴露端口

EXPOSE 8787 8899

# 启动 supervisord

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]

