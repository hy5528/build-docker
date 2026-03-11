# 使用官方 Python 映像檔作為基礎
FROM python:3.9-slim

# 安裝 curl（用於健康檢查）
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# 設定工作目錄
WORKDIR /app

# 複製依賴檔案並安裝
COPY requirements.txt .
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
