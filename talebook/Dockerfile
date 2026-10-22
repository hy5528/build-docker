FROM ubuntu:22.04

# 设置非交互式安装
ENV DEBIAN_FRONTEND=noninteractive

# 安装基本工具
RUN apt-get update && apt-get install -y \
    wget \
    unzip \
    git \
    openjdk-17-jdk \
    python3 \
    python3-pip \
    curl \
    gnupg \
    software-properties-common \
    && rm -rf /var/lib/apt/lists/*


# 安装Gradle
RUN wget -q https://services.gradle.org/distributions/gradle-8.13-bin.zip -O /tmp/gradle.zip && \
    unzip -q /tmp/gradle.zip -d /opt/ && \
    ln -s /opt/gradle-8.13/bin/gradle /usr/local/bin/gradle && \
    rm /tmp/gradle.zip

# 创建工作目录
WORKDIR /workspace

# 复制项目文件
COPY . /workspace/

# 设置构建命令
CMD ["gradle", ":app:assembleDebug", "--no-daemon", "--console=plain"]
