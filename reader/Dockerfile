# 第一阶段：构建Vue项目
FROM --platform=$BUILDPLATFORM node:22-alpine AS builder

RUN apk add --no-cache python3

WORKDIR /app/web

# 复制package文件
COPY package*.json ./

# 安装依赖（使用淘宝镜像加速）
RUN npm install
    

# 复制源代码并构建
COPY . .
RUN npm run build

# Build jar
FROM gradle:7-jdk8 AS build-env
ENV JAVA_TOOL_OPTIONS="-Dhttps.protocols=TLSv1,TLSv1.1,TLSv1.2,TLSv1.3"
ADD --chown=gradle:gradle . /app
WORKDIR /app
COPY --from=build-web /app/web/dist /app/src/main/resources/web
RUN \
    rm src/main/java/com/htmake/reader/ReaderUIApplication.kt; \
    gradle -b cli.gradle assemble --info; \
    mv ./build/libs/*.jar ./build/libs/reader.jar

FROM jackkke/openjdk:8-jdk-alpine
RUN \
    apk add --no-cache ca-certificates tini tzdata; \
    update-ca-certificates; \
    rm -rf /var/cache/apk/*;

ENV TZ=Asia/Shanghai

EXPOSE 8080
ENTRYPOINT ["/sbin/tini", "--"]
COPY --from=build-env /app/build/libs/reader.jar /app/bin/reader.jar
CMD ["java", "-jar", "/app/bin/reader.jar"]
