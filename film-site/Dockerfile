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
RUN chmod +x manage.py
RUN python manage.py makemigrations videos
RUN python manage.py migrate

# 暴露端口
EXPOSE 8000


# 启动命令
CMD ["python manage.py runserver"]
