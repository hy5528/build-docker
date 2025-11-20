FROM alpine:3

ARG VERSION

RUN set -ex && \
    apk add --no-cach mopidy


ENV TZ=Asia/Shanghai

EXPOSE 6600 6680

ENTRYPOINT ["mopidy"]
