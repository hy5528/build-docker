# syntax=docker/dockerfile:1
#
ARG IMAGEBASE=frommakefile
#
FROM alpine:3.22
#
ENV \
    S6_USER=mpd \
    S6_USERHOME=/var/lib/mpd
#
RUN set -xe \
    && apk update \
    && apk add --no-cache \
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
    && addgroup pulse \
    && chmod 1777 /var/run/mpd \
    && rm -rf /var/cache/apk/* /tmp/*
#

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
