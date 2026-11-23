FROM python:3.11-alpine

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PPPLAYER_USE_SYSTEM_PROXY=0

WORKDIR /app

# Alpine 用 apk；--no-cache 不产生缓存层。ca-certificates 供 HTTPS 使用，tzdata 让 TZ=Asia/Shanghai 生效。
RUN apk add --no-cache ca-certificates tzdata

COPY requirements.web.txt /app/requirements.web.txt
# --only-binary=:all: 强制走预编译 wheel，避免 lxml 在 musl 上回退源码编译（缺编译器/头文件）。
RUN python -m pip install --no-cache-dir --only-binary=:all: -r /app/requirements.web.txt

# 只复制 Web/API 运行所需内容；不要导入 main.py（pywebview/winreg 等 Windows-only）。
COPY src /app/src
COPY static /app/static
# 版本号唯一来源：/api/version 在纯 Web 启动时从此文件读取（[project].version）。
COPY pyproject.toml /app/pyproject.toml

EXPOSE 19527

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:19527/api/version', timeout=2)"

CMD ["python", "-c", "from src.server import create_app; create_app().run(host='0.0.0.0', port=19527, threaded=True, use_reloader=False)"]
