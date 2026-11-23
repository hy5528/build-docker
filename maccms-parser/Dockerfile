FROM python:3.11-alpine

# 1. 安裝編譯工具和 Python 開發頭文件
# build-base: 包含 gcc, g++, make 等
# python3-dev: 包含 Python.h 頭文件，編譯 C 擴展必需
# libffi-dev & openssl-dev: cryptography 等庫常見依賴
RUN apk add --no-cache \
    build-base \
    python3-dev \
    libffi-dev \
    openssl-dev \
    ca-certificates \
    tzdata \
    curl

# 設定工作目錄
WORKDIR /app

# 複製依賴檔案並安裝
COPY requirements.txt .

# 2. 升級 pip, setuptools, wheel 以獲得更好的兼容性
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# 3. 安裝項目依賴
# 如果仍有問題，可嘗試添加 --no-build-isolation 或單獨安裝困難套件
RUN pip install --no-cache-dir -r requirements.txt

# 複製專案所有檔案到工作目錄
COPY . .

# 宣告資料 Volume
VOLUME /app/data

# 宣告容器對外的連接埠
EXPOSE 5000

CMD ["gunicorn", \
     "--worker-class", "sync", \
     "--workers", "2", \
     "--timeout", "120", \
     "--graceful-timeout", "25", \
     "--max-requests", "800", \
     "--max-requests-jitter", "80", \
     "--keep-alive", "4", \
     "--preload", \
     "--bind", "0.0.0.0:5000", \
     "--access-logfile", "-", \
     "--error-logfile", "-", \
     "web_app:app"]
