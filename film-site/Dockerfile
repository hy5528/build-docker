# 第一阶段：构建
FROM python:3.12-slim as builder

WORKDIR /app
COPY requirements.txt .
# 安装到指定前缀，方便复制
RUN pip install --prefix=/install -r requirements.txt

COPY . .
RUN python manage.py collectstatic --noinput || true

# 第二阶段：生产
FROM python:3.12-slim

WORKDIR /app

# 从 builder 阶段复制依赖
COPY --from=builder /install /usr/local

# 复制代码
COPY --from=builder /app /app
ADD --chmod=755 ./entrypoint.sh /app/entrypoint.sh
EXPOSE 8000

CMD ["/app/entrypoint.sh", \
     "--worker-class", "sync", \
     "--workers", "2", \
     "--timeout", "120", \
     "--graceful-timeout", "25", \
     "--max-requests", "800", \
     "--max-requests-jitter", "80", \
     "--keep-alive", "4", \
     "--preload", \
     "--bind", "0.0.0.0:8000"]
