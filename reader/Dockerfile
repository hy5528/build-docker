FROM node:22-bookworm-slim



# 只安装必要的依赖
RUN apt-get update && apt-get install -y \
    wget \
    unzip \
    openjdk-17-jdk \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
# 设置执行权限

ADD --chmod=755 ./gradlew /gradlew

# 默认命令
CMD ["./gradlew", "--version"]
