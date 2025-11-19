FROM alpine:3

ARG VERSION

RUN set -xe && \
    apk add --no-cache \
        mopidy \
        Mopidy-Iris \
        Mopidy-Loca \
        Mopidy-MPD \
        Mopidy-Mobile 

EXPOSE 6600 6680

ENTRYPOINT ["mopidy"]
