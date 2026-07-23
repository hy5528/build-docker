FROM node:16-alpine AS build-web
ADD . /app
WORKDIR /app/web
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

# Create minimal JRE with jlink
FROM amazoncorretto:17-alpine AS jre-builder
RUN apk add --no-cache binutils
COPY --from=build-env /app/build/libs/reader.jar /tmp/reader.jar
RUN \
    jdeps --print-module-deps --ignore-missing-deps /tmp/reader.jar > /tmp/jdeps-modules.txt; \
    echo "java.sql,java.naming,java.management,java.instrument,jdk.unsupported,java.security.jgss,java.desktop" | tr ',' '\n' >> /tmp/jdeps-modules.txt; \
    MODULES=$(sort -u /tmp/jdeps-modules.txt | paste -sd, -); \
    echo "Using modules: $MODULES"; \
    jlink \
        --compress=2 \
        --no-header-files \
        --no-man-pages \
        --strip-debug \
        --add-modules "$MODULES" \
        --output /opt/jre-minimal

FROM alpine:3.21
# Install base packages
RUN \
    apk add --no-cache ca-certificates tini tzdata; \
    update-ca-certificates; \
    rm -rf /var/cache/apk/*;

# 时区
ENV TZ=Asia/Shanghai

COPY --from=jre-builder /opt/jre-minimal /opt/jre
COPY --from=build-env /app/build/libs/reader.jar /app/bin/reader.jar

ENV JAVA_HOME=/opt/jre
ENV PATH="${JAVA_HOME}/bin:${PATH}"

EXPOSE 8080
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["java", "-jar", "/app/bin/reader.jar"]
