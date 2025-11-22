FROM  debian:12-slim AS base

 RUN apt-get update \
 && apt-get install -y curl \
  dumb-init \
  shadow \
  sudo \
  py-pip \
  alpine-sdk \
  python3-dev\
  py3-pip \
 && apt purge --auto-remove -y \
    gcc \
 && apt clean \
 && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* ~/.cache /root/.cache


# 设置工作目录
WORKDIR /app
# 安装依赖
FROM alpine:3.22.2

COPY requirements.txt .
RUN pip3 install --upgrade --break-system-packages pip \
&& pip3 install --break-system-packages --no-cache-di -r requirements.txt

# 拷贝项目代码
COPY . .

# 暴露端口
EXPOSE 8000

# 运行 uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
