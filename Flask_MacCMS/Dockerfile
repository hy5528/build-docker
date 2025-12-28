FROM python:3.14.0-slim

LABEL maintainer="CMS Movie"
LABEL description="Flask-based video CMS with MacCMS10 collector"

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    gcc \
    libxml2-dev \
    libxslt1-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY requirements.txt .

# 安装Python依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY . .

# 创建必要的目录
RUN mkdir -p instance backups app/static/uploads/posters logs

# 设置权限
RUN chmod +x start.py db_manager.py

# 暴露端口
EXPOSE 5000

# 创建启动脚本
RUN echo '#!/bin/bash\n\
python3 db_manager.py init 2>/dev/null || true\n\
exec gunicorn -w 4 -b 0.0.0.0:5000 --access-logfile - --error-logfile - "app:create_app()"' > /app/entrypoint.sh \
    && chmod +x /app/entrypoint.sh

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:5000/health', timeout=5)" || exit 1

# 启动命令
CMD ["/app/entrypoint.sh"]
