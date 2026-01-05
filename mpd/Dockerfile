FROM alpine:3

ARG VERSION


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
 CMD nc -z -i 1 -w 1 localhost ${MPD_PORT:-6600} \
        && wget --quiet --tries=1 --no-check-certificate --spider http://localhost:${MPD_WEB_PORT:-64801} \
        || exit 1
#
ENTRYPOINT ["/usr/bin/mpd", "--no-daemon", "--stdout", "/etc/mpd.conf"]

