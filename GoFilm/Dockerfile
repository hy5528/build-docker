FROM python:3.12-slim

# 设置环境变量
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    # 设置 Gunicorn/Uvicorn 的生产级默认参数
    UVICORN_WORKERS=4 \
    UVICORN_TIMEOUT=120 \
    UVICORN_BACKLOG=2048 \
    UVICORN_LIMIT_CONCURRENCY=5000

# 安装系统依赖
# 注意：slim 镜像不含 curl，若需保留 curl 健康检查需安装，或改用 python 方式
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
    gcc \
    libxml2-dev \
    libxslt1-dev \
    build-essential \
    # 如果坚持用 curl 做健康检查，请取消下面注释
    # curl \
 && rm -rf /var/lib/apt/lists/*

# 创建非 root 用户
RUN groupadd -r app && useradd -r -g app -d /app -s /usr/sbin/nologin app

WORKDIR /app

# 复制依赖文件并安装
COPY requirements.txt ./

# 关键：安装 uvicorn[standard] 以启用 uvloop 和 httptools
# 同时安装 gunicorn 和 uvicorn-worker (如果 uvicorn 版本较新，worker 已内置，否则需单独安装)
RUN pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir "uvicorn[standard]" gunicorn

# 复制应用代码
COPY . ./

# 更改所有权
RUN chown -R app:app /app

# 切换到非 root 用户
USER app

EXPOSE 8000

# 健康检查：使用 python 内置 urllib 避免依赖 curl，更轻量且兼容 slim 镜像
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health')" || exit 1

# 生产环境启动命令：Gunicorn + Uvicorn Worker
# -w: worker 数量，建议设为 (2 * CPU核心数) + 1
# -k: worker 类，指定为 uvicorn.workers.UvicornWorker
# --bind: 绑定地址
# --graceful-timeout: 优雅关闭超时时间
CMD ["gunicorn", "main:app", \
     "-w", "$UVICORN_WORKERS", \
     "-k", "uvicorn.workers.UvicornWorker", \
     "--bind", "0.0.0.0:8000", \
     "--timeout", "$UVICORN_TIMEOUT", \
     "--backlog", "$UVICORN_BACKLOG", \
     "--limit-request-line", "4094", \
     "--limit-field-size", "8190", \
     "--graceful-timeout", "30"]
