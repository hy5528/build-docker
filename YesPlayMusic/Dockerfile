# Stage 1: Base image with all runtimes
FROM debian:12-slim 

WORKDIR /app
RUN 
# 安装deb包并处理依赖
RUN dpkg -i /tmp/your-package.deb || apt-get update && apt-get install -f -y

EXPOSE 80

CMD ["node"] 
