# 第一阶段：构建
FROM python:3.11-slim as builder

WORKDIR /app
COPY requirements.txt .
# 安装到指定前缀，方便复制
RUN pip install --prefix=/install -r requirements.txt

COPY . .
RUN python manage.py collectstatic --noinput || true

# 第二阶段：生产
FROM python:3.11-slim

WORKDIR /app

# 从 builder 阶段复制依赖
COPY --from=builder /install /usr/local

# 复制代码
COPY --from=builder /app /app

# 创建目录
RUN mkdir -p instance backups app/static/uploads/posters logs media

EXPOSE 8000

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]
