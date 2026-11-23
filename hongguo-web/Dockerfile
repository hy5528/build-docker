
# 只跑 Node，不需要浏览器与 FFmpeg
FROM --platform=$BUILDPLATFORM node:22-alpine

# 安装 FFmpeg 及其 HEVC 解码依赖
# libva-intel-driver: 如果需要 Intel 核显硬件加速 (VAAPI)
# intel-media-driver: 较新 Intel CPU 所需的驱动 (QSV)
RUN apk add --no-cache \
    ffmpeg \
    libva \
    python3 \
    libva-intel-driver \
    intel-media-driver \
    v4l-utils

# 验证安装
RUN ffmpeg -decoders | grep hevc


# 设置工作目录

WORKDIR /app


# 复制 package.json 和 lock 文件以利用缓存

COPY server/package*.json ./

# 安装依赖

RUN npm ci --prefix .


# 暴露端口

EXPOSE 8787 8899

# 启动服务

CMD ["node", "server/index.mjs","webapp/server.js"]

