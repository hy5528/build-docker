# 第一阶段：构建依赖
FROM python:3.12-slim AS builder

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

# 第二阶段：运行时镜像
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    PATH="/opt/venv/bin:$PATH"

# 安装运行时必要的系统库 (不需要 -dev 包)
# libxml2 和 libxslt1.1 是 lxml 运行时需要的
# curl 用于健康检查
RUN apt-get update && apt-get install -y --no-install-recommends \
    libxml2 \
    libxslt1.1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 创建非 root 用户
RUN groupadd -r app && useradd -r -g app -d /app -s /usr/sbin/nologin app

WORKDIR /app

# 从构建阶段复制虚拟环境
COPY --from=builder /opt/venv /opt/venv

# 复制应用代码
COPY . ./

# 设置权限
RUN chown -R app:app /app
USER app

EXPOSE 8000

# 健康检查
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD curl -fsS http://127.0.0.1:8000/health || exit 1

# 启动命令
# 注意：uvicorn[standard] 已经在 requirements.txt 中安装，这里直接运行
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
