FROM eclipse-temurin:17-jre-alpine





# 设置执行权限

WORKDIR /workspace
ADD --chmod=755 ./gradlew /gradlew


# 默认命令
CMD ["./gradlew", "--version"]
