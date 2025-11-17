FROM --platform=$BUILDPLATFORM debian:12-slim AS base

ARG ARCH=amd64
ARG GST_PLUGIN_SPOTIFY_VERSION_PATH=0.14.0-alpha.1-1
ARG GST_PLUGIN_SPOTIFY_VERSION_FILE=0.14.0.alpha.1-1
RUN apt-get update

RUN apt-get install -y mopidy
RUN apt-get install -y python3-pip

RUN apt-get install -y curl
RUN apt-get install -y alsa-utils

RUN apt-get install -y python3-venv
RUN python3 -m venv /opt/mopidy-venv
ENV PATH="/opt/mopidy-venv/bin:$PATH"

# extensions
RUN python3 -m pip install --target /opt/mopidy-venv --upgrade Mopidy-Iris
RUN python3 -m pip install --target /opt/mopidy-venv --upgrade Mopidy-Tidal
RUN python3 -m pip install --target /opt/mopidy-venv --upgrade Mopidy-Local
RUN python3 -m pip install --target /opt/mopidy-venv --upgrade Mopidy-MPD
RUN python3 -m pip install --target /opt/mopidy-venv --upgrade Mopidy-Mobile

RUN curl -L -o gst-plugin-spotify_${GST_PLUGIN_SPOTIFY_VERSION_FILE}_${ARCH}.deb https://github.com/kingosticks/gst-plugins-rs-build/releases/download/gst-plugin-spotify_${GST_PLUGIN_SPOTIFY_VERSION_PATH}/gst-plugin-spotify_${GST_PLUGIN_SPOTIFY_VERSION_FILE}_${ARCH}.deb \
 && dpkg -i gst-plugin-spotify_${GST_PLUGIN_SPOTIFY_VERSION_FILE}_${ARCH}.deb \
  ; apt update && apt -f install -y \
 && rm gst-plugin-spotify_${GST_PLUGIN_SPOTIFY_VERSION_FILE}_${ARCH}.deb \
 && curl -L -o libshout3_2.4.1-2_${ARCH}.deb http://ftp.de.debian.org/debian/pool/main/libs/libshout/libshout3_2.4.1-2_${ARCH}.deb \
 && dpkg -i libshout3_2.4.1-2_${ARCH}.deb \
  ; apt update && apt -f install -y \
 && rm libshout3_2.4.1-2_${ARCH}.deb

RUN apt-get install -y gstreamer1.0-plugins-bad

RUN mkdir -p /build

COPY build/cleanup.sh /build
RUN chmod u+x /build/cleanup.sh
RUN /build/cleanup.sh
RUN rm /build/cleanup.sh

RUN rmdir /build

FROM scratch
COPY --from=base / /

LABEL maintainer="hy5528"

RUN mkdir -p /app/bin

VOLUME /config
VOLUME /cache
VOLUME /data
VOLUME /music

ENV USER_MODE=""
ENV PUID=""
ENV PGID=""
ENV AUDIO_GID=""

ENV RESTORE_STATE=""

ENV AUDIO_OUTPUT=""

ENV SCROBBLER_ENABLED=""
ENV SCROBBLER_USERNAME=""
ENV SCROBBLER_PASSWORD=""

ENV TIDAL_ENABLED=""
ENV TIDAL_QUALITY=""
ENV TIDAL_LOGIN_SERVER_PORT=""
ENV TIDAL_LOGIN_METHOD=""
ENV TIDAL_AUTH_METHOD=""
ENV TIDAL_PLAYLIST_CACHE_REFRESH_SECS=""
ENV TIDAL_LAZY=""

ENV JELLYFIN_ENABLED=""
ENV JELLYFIN_HOSTNAME=""
ENV JELLYFIN_USERNAME=""
ENV JELLYFIN_PASSWORD=""
ENV JELLYFIN_LIBRARIES=""

ENV FILE_ENABLED=""
ENV LOCAL_ENABLED=""
ENV LOCAL_MEDIA_DIR=""
ENV LOCAL_MAX_SEARCH_RESULTS=""
ENV LOCAL_SCAN_TIMEOUT=""
ENV LOCAL_SCAN_FOLLOW_SYMLINKS=""
ENV LOCAL_SCAN_FLUSH_THRESHOLD=""
ENV LOCAL_INCLUDED_FILE_EXTENSIONS=""
ENV LOCAL_EXCLUDED_FILE_EXTENSIONS=""
ENV LOCAL_DIRECTORIES=""
ENV LOCAL_TIMEOUT=""
ENV LOCAL_USE_ARTIST_SORTNAME=""
ENV LOCAL_ALBUM_ART_FILES=""

ENV MPD_ENABLED=""

ENV MOBILE_ENABLED=""
ENV MOBILE_TITLE=""
ENV MOBILE_WS_URL=""

ENV LOG_LEVEL=""

ENV PYTHONPATH="/opt/mopidy-venv"
ENV PATH="/opt/mopidy-venv/bin:$PATH"

COPY app/bin/entrypoint.sh /app/bin/
RUN chmod +x /app/bin/entrypoint.sh

ENTRYPOINT ["/app/bin/entrypoint.sh"]
