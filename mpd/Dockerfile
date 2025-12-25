FROM alpine:3

ARG VERSION
#
#
RUN set -xe \

    && apk add --no-cache --purge \
        alsa-lib \
        alsa-plugins-pulse \
        alsa-utils \
        libmpdclient \
        libpulse \
        mpc \
        mpd \
        mpdscribble \
        ncmpcpp \
        ympd \
    # && echo "http://dl-cdn.alpinelinux.org/alpine/edge/main/" >> /etc/apk/repositories \
    # && echo "http://dl-cdn.alpinelinux.org/alpine/edge/community/" >> /etc/apk/repositories \
    # && echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing/" >> /etc/apk/repositories \
    # && apk add -U --no-cache \
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
