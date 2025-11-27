# Stage 1: Base image with all runtimes
FROM debian:12-slim 
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && \
    apt-get install -y wget
WORKDIR /app
RUN wget https://github.com/stark81/VutronMusic/releases/download/v2.7.0/VutronMusic-2.7.0_linux_amd64.deb
# 安装deb包并处理依赖
RUN dpkg -i /app/VutronMusic-2.7.0_linux_amd64.deb || apt-get update && apt-get install -f -y

EXPOSE 80

