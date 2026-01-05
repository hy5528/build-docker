FROM alpine:3.23.0

ARG BUILD_DATE
ARG VCS_REF

LABEL org.opencontainers.image.authors="Tom Swartz <tom@tswartz.net>" \
    org.opencontainers.image.title="MPD" \
    org.opencontainers.image.description="MPD - Music Player Daemon" \
    org.opencontainers.image.source="https://github.com/tomswartz07/mpd-docker"

COPY mpd.conf /etc/mpd.conf

RUN set -eux; \
    apk --no-cache add \
        mpd \
        mpc; \
    mkdir -p /mpd/data; \
    touch /mpd/data/database \
        /mpd/data/state \
        /mpd/data/sticker.sql \
    ; \
    chown -R mpd:audio /mpd; \
    cp /etc/mpd.conf /etc/mpd.conf.backup; \
    chown -R mpd:audio /etc/mpd.conf*

VOLUME /mpd
WORKDIR /mpd
EXPOSE 6600 8000

CMD ["/usr/bin/mpd", "--no-daemon", "--stdout", "/etc/mpd.conf"]
