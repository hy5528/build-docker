FROM debian:12-slim

ENV DEBIAN_FRONTEND=noninteractive

# 只安装必要的依赖
RUN apt-get update && apt-get install -y \
    wget \
    unzip \
    openjdk-17-jdk \
    && rm -rf /var/lib/apt/lists/*


# 设置执行权限

ADD --chmod=755 ./gradlew /gradlew

# 默认命令
CMD ["./gradlew", "--version"]
