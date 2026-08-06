FROM FROM --platform=$BUILDPLATFORM node:22-alpine

ENV DEBIAN_FRONTEND=noninteractive

# 只安装必要的依赖
RUN apk add --no-cache wget unzip openjdk-17-jdk


# 设置执行权限

ADD --chmod=755 ./gradlew /gradlew

# 默认命令
CMD ["./gradlew", "--version"]
