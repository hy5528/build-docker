# 第一阶段：构建依赖
FROM python:3.11-slim AS builder

# 设置环境变量，优化 pip 行为
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    LANG=C.UTF-8 \
    LC_ALL=C.UTF-8

# 安装编译 lxml 和其他 C 扩展所需的系统依赖
# libxml2-dev 和 libxslt1-dev 是 lxml 编译必须的
# gcc/g++/build-essential 是编译工具链
# pkg-config 帮助找到库文件
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    build-essential \
    libxml2-dev \
    libxslt1-dev \
    zlib1g-dev \
    libffi-dev \
    libssl-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*
RUN groupadd -r app && useradd -r -g app -d /app -s /usr/sbin/nologin app

WORKDIR /app

# 复制依赖文件
COPY requirements.txt ./

# 创建虚拟环境并安装依赖
# 使用 venv 可以隔离环境，方便后续复制
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# 升级 pip 并安装 requirements.txt 中的依赖
# 注意：这里会编译 lxml, uvloop, orjson 等
RUN pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

COPY . ./

RUN chown -R app:app /app
USER app

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD curl -fsS http://127.0.0.1:8000/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
