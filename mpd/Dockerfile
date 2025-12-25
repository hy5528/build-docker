FROM alpine:3

ARG VERSION

RUN set -ex && \
    apk add --no-cache \
        lsa-lib \
        alsa-plugins-pulse \
        alsa-utils \
        libmpdclient \
        libpulse \
        mpc \
        mpd \
        mpdscribble \
        ncmpcpp \
        ympd \
    && mkdir -p /defaults \
    && mv /etc/mpd.conf /defaults/mpd.conf.default \
    && mv /etc/mpdscribble.conf /defaults/mpdscribble.conf.default \
    && addgroup pulse \
    && adduser ${S6_USER} audio \
    && adduser ${S6_USER} pulse \
    && chmod 1777 /var/run/mpd \
    && rm -rf /var/cache/apk/* /tmp/*
#
COPY root/ /
#
VOLUME /var/lib/mpd/ /music
#
EXPOSE 6600 8000 64801
#
HEALTHCHECK \
    --interval=2m \
    --retries=5 \
    --start-period=5m \
    --timeout=10s \
    CMD nc -z -i 1 -w 1 localhost ${MPD_PORT:-6600} \
        && wget --quiet --tries=1 --no-check-certificate --spider http://localhost:${MPD_WEB_PORT:-64801} \
        || exit 1
#
ENTRYPOINT ["/init"]
