FROM --platform=$BUILDPLATFORM node:18-alpine AS build-web
ADD . /app
WORKDIR /app/web
# 忽略引擎检查以兼容旧依赖
RUN yarn install --ignore-engines && yarn build

# Build jar - 使用支持多平台的Gradle镜像
FROM gradle:7.6-jdk8 AS build-env
ADD --chown=gradle:gradle . /app
WORKDIR /app
COPY --from=build-web /modules/web/dist /app/src/main/resources/web
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
CMD ["java", "-jar", "/app/bin/reader.jar" ]
