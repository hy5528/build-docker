# 使用官方 Python 运行时作为父镜像
FROM python:3.9-slim

# 设置工作目录
WORKDIR /app

# 安装依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 拷贝项目代码
COPY . .

# 暴露端口
EXPOSE 8000

# 运行 uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]