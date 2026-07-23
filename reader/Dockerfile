FROM node:16-alpine AS build-web
ADD . /app
WORKDIR /app/web
# Build web
RUN yarn install --ignore-engines && yarn build

# Build jar
FROM gradle:7-jdk8 AS build-env
ADD --chown=gradle:gradle . /app
WORKDIR /app
COPY --from=build-web /app/web/dist /app/src/main/resources/web
ENV JAVA_TOOL_OPTIONS="-Dhttps.protocols=TLSv1,TLSv1.1,TLSv1.2,TLSv1.3"
RUN \
    rm src/main/java/com/htmake/reader/ReaderUIApplication.kt; \
    gradle -b cli.gradle assemble --info; \
    mv ./build/libs/*.jar ./build/libs/reader.jar

FROM ibm-semeru-runtimes:open-8-jre
# Install base packages
RUN \
    apt-get update; \
    apt-get install -y --no-install-recommends ca-certificates tini tzdata; \
    update-ca-certificates; \
    rm -rf /var/lib/apt/lists/*;

# 时区
ENV TZ=Asia/Shanghai

EXPOSE 8080
ENTRYPOINT ["/usr/bin/tini", "--"]
COPY --from=build-env /app/build/libs/reader.jar /app/bin/reader.jar
CMD ["java", "-jar", "/app/bin/reader.jar" ]
