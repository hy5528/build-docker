FROM eclipse-temurin:8u492-b09-jre-resolute

ENV TZ=Asia/Shanghai \
    READER_APP_STORAGEPATH=/storage \
    READER_SERVER_PORT=8080

WORKDIR /app
COPY build/libs/reader-2.5.4.jar /app/reader.jar

VOLUME /storage
EXPOSE 8080

# --add-opens 用于 Gson 在 JDK 17+ 上反射访问 java.io.File#path
CMD ["java", \
     "--add-opens", "java.base/java.io=ALL-UNNAMED", \
     "-jar", "/app/reader.jar", \
     "--reader.server.port=${READER_SERVER_PORT}", \
     "--reader.app.storagePath=${READER_APP_STORAGEPATH}"]
