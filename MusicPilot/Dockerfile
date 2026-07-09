# MusicPilot Backend Dockerfile
FROM python:3.12-slim

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件和应用代码
COPY backend/pyproject.toml ./
COPY backend/app/ ./app/

# 安装 Python 依赖
RUN pip install --no-cache-dir -e .

# 创建必要目录
RUN mkdir -p logs cache media

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
