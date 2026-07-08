# ============================================================
#  Dockerfile.tiny — 精简版（Tiny）
#  与完整版的区别：不安装 YouTube / TIDAL / Apple Music 三个源
#  所需的重型系统依赖（ffmpeg、nodejs）和 Python 包（av、aigpy、
#  nodejs-wheel、pywidevine、ytmusicapi），其余 39 个源全部保留。
#  镜像体积 ~460MB → ~150MB
# ============================================================

# ── Stage 1: 前端构建 ──
FROM node:20-alpine AS frontend-builder

WORKDIR /build/frontend
COPY http_server/frontend/package.json http_server/frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY http_server/frontend/ ./
RUN npm run build

# ── Stage 2: 裁剪 musicdl 依赖 ──
FROM alpine:3.21 AS musicdl-trimmer

WORKDIR /build/musicdl
COPY musicdl/ ./

# 从 requirements.txt 中移除 YouTube / TIDAL / Apple 三个源的专属重型依赖
# ┌──────────────┬──────────────────────────────┐
# │ 移除的包      │ 仅被谁使用                    │
# ├──────────────┼──────────────────────────────┤
# │ aigpy        │ TIDAL                        │
# │ av           │ TIDAL（PyAV + bundled ffmpeg） │
# │ nodejs-wheel │ YouTube（内嵌 Node.js 二进制） │
# │ ytmusicapi   │ YouTube                      │
# │ pywidevine   │ Apple Music (DRM)            │
# └──────────────┴──────────────────────────────┘
# 注：m3u8（252KB）虽仅被 Apple/TIDAL 使用，但 hls.py 被
#     base.py 顶层导入，移除会导致所有源加载失败，故保留。
RUN sed -i \
    -e '/^aigpy$/d' \
    -e '/^av$/d' \
    -e '/^nodejs-wheel$/d' \
    -e '/^ytmusicapi$/d' \
    -e '/^pywidevine$/d' \
    requirements.txt

# 从 sources/__init__.py 中移除 TIDAL / Apple / YouTube 的 import 和注册项
# 这三个源的顶层 import 会立即触发缺失依赖的 ImportError，导致服务无法启动
RUN sed -i \
    -e '/^from .tidal import/d' \
    -e '/^from .apple import/d' \
    -e '/^from .youtube import/d' \
    -e "s/'YouTubeMusicClient': YouTubeMusicClient, //g" \
    -e "s/'AppleMusicClient': AppleMusicClient, //g" \
    -e "s/ 'TIDALMusicClient': TIDALMusicClient,//g" \
    musicdl/modules/sources/__init__.py

# ── Stage 3: Python 依赖编译 ──
FROM python:3.12-alpine AS python-builder

RUN apk add --no-cache \
        gcc g++ musl-dev libffi-dev curl-dev openssl-dev

WORKDIR /build

COPY --from=musicdl-trimmer /build/musicdl /build/musicdl
RUN pip install --no-cache-dir --prefix=/install /build/musicdl/ \
    && pip install --no-cache-dir --prefix=/install pycryptodomex

COPY http_server/requirements.txt /build/
RUN pip install --no-cache-dir --prefix=/install -r /build/requirements.txt

# 瘦身
RUN set -eux; \
    SITE=/install/lib/python3.12/site-packages; \
    rm -rf "$SITE"/pip "$SITE"/pip-*.dist-info \
           "$SITE"/setuptools "$SITE"/setuptools-*.dist-info; \
    find /install -type d -name '__pycache__' -exec rm -rf {} + 2>/dev/null || true; \
    find /install -name '*.pyc' -delete 2>/dev/null || true; \
    find /install -path '*.dist-info/RECORD' -delete 2>/dev/null || true

# ── Stage 4: 运行时镜像（无 ffmpeg、无 nodejs）──
FROM python:3.12-alpine

RUN apk add --no-cache \
        libcurl \
        tini \
    && mkdir -p /app/workdir

COPY --from=python-builder /install /usr/local

WORKDIR /app
COPY http_server/server.py http_server/api_handler.py ./
COPY http_server/templates/ ./templates/
COPY --from=frontend-builder /build/static/dist/ ./static/dist/

ENV PYTHONUNBUFFERED=1 \
    MUSICDL_WORK_DIR=/app/workdir

EXPOSE 8866
VOLUME ["/app/workdir"]

ENTRYPOINT ["tini", "--"]
CMD ["python", "server.py", "--host", "0.0.0.0", "--port", "8866"]
