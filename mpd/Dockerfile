FROM alpine:3.23.0

ARG BUILD_DATE
ARG VCS_REF


COPY mpd.conf /etc/mpd.conf

RUN set -eux; \
    apk --no-cache add \
        mpd \
        mpc \
        mpdscribble \
        ncmpcpp \
        ympd; \
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
EXPOSE 6600 8000 64801

CMD ["/usr/bin/mpd", "--no-daemon", "--stdout", "/etc/mpd.conf"]
