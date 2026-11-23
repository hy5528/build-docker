
# 只跑 Node，不需要浏览器与 FFmpeg
FROM --platform=$BUILDPLATFORM node:22-alpine

# 安装 FFmpeg 及其 HEVC 解码依赖
# libva-intel-driver: 如果需要 Intel 核显硬件加速 (VAAPI)
# intel-media-driver: 较新 Intel CPU 所需的驱动 (QSV)
RUN apk add --no-cache \
    ffmpeg \
    libva \
    libva-intel-driver \
    intel-media-driver \
    v4l-utils

# 验证安装
RUN ffmpeg -decoders | grep hevc


ENV NODE_ENV=production \
    PORT=5178 \
    HOST=0.0.0.0 \
    HG_CACHE_DIR=/app/data/media

WORKDIR /app

# 零依赖：只需要拷源码，没有 npm install
COPY package.json ./


EXPOSE 5178


USER node

VOLUME ["/app/data"]

CMD ["node", "webapp/server.js"]
