# 多阶段构建：依赖层与代码层分离，改动代码时无需重装依赖
FROM python:3.12-slim AS base

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    TZ=Asia/Shanghai

WORKDIR /app

# 构建信息（v1.9.3 起由 CI 传入，本地 build 用默认值）
#   APP_VERSION   —— 与 app/__init__.py 的 __version__ 一致，CI 用它生成镜像 tag
#   APP_REVISION  —— 构建所用提交的完整 SHA，写进镜像标签 + 环境变量，
#                    部署后 `docker inspect` 与 `GET /healthz` 都能看到
ARG APP_VERSION=dev
ARG APP_REVISION=unknown

LABEL org.opencontainers.image.title="VodSync" \
      org.opencontainers.image.description="影视数据同步服务：MacCMS 源站采集 + 统一视频 API" \
      org.opencontainers.image.version="${APP_VERSION}" \
      org.opencontainers.image.revision="${APP_REVISION}"

# 运行时暴露给 /healthz，方便升级/回滚后核对容器里跑的是哪个构建
ENV VODSYNC_BUILD_SHA=${APP_REVISION}

# 先装依赖（利用 Docker 层缓存）
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 再拷贝代码
COPY app ./app

# 数据目录（断点状态 pause_state.json 落在这里；数据库在 PostgreSQL 容器里）
ENV DATA_DIR=/app/data
VOLUME ["/app/data"]

EXPOSE 8000

HEALTHCHECK --interval=60s --timeout=10s --start-period=30s --retries=3 \
    CMD python -c "import urllib.request;urllib.request.urlopen('http://127.0.0.1:8000/healthz', timeout=5)" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
