FROM --platform=$BUILDPLATFORM node:22-alpine



# 只安装必要的依赖
RUN apk update && \
    apk add --no-cache openjdk17-jdk 

# 设置执行权限
WORKDIR /app
ADD --chmod=755 ./gradlew /app/gradlew


# 默认命令
CMD ["./gradlew", "--version"]
