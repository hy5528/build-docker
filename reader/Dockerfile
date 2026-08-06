FROM alpine:3.24


# 只安装必要的依赖
RUN apk add --no-cache wget unzip openjdk8-jre


# 安装Gradle
RUN wget -q https://services.gradle.org/distributions/gradle-8.13-bin.zip -O /tmp/gradle.zip && \
    unzip -q /tmp/gradle.zip -d /opt/ && \
    ln -s /opt/gradle-8.13/bin/gradle /usr/local/bin/gradle && \
    rm /tmp/gradle.zip

# 创建工作目录
WORKDIR /workspace

# 复制项目文件
COPY . /workspace/

# 默认命令
CMD ["./gradlew", "--version"]
