FROM ghcr.io/linuxserver/baseimage-debian:bookworm

# set version label
ARG BUILD_DATE
ARG VERSION

LABEL build_version="Linuxserver.io version:- ${VERSION} Build-date:- ${BUILD_DATE}"
LABEL maintainer="sweisgerber"

# environment settings
ARG DEBIAN_FRONTEND="noninteractive"
#
# Official Mopidy install for Debian/Ubuntu along with some extensions #################################################
#
RUN set -ex \
 echo "**** install runtime packages ****" \
 && apt-get update \
 && apt-get install -y \
      gir1.2-gst-plugins-base-1.0 \
      gir1.2-gstreamer-1.0 \
      gstreamer1.0-plugins-good \
      gstreamer1.0-plugins-ugly \
      gstreamer1.0-tools \
      libcairo2-dev \
      libgirepository-2.0-dev \
      python3-gst-1.0
      python3-pip \
 && python3 -m pip install --upgrade mopidy \ 
 && pip install --no-cache-dir --upgrade pip wheel \
 && pip install --no-cache-dir --upgrade \
      mopidy-mpd \
      Mopidy-Iris \
      Mopidy-Local \
      Mopidy-Mobile \
      Mopidy-SomaFM \
  && echo "**** cleanup ****" \
  && apt-get -y autoremove \
  && apt-get clean  \
  && rm -rf \
    /tmp/* \
    /var/lib/apt/lists/* \
    /var/tmp/* \
    /var/log/* \
    /usr/share/man
# ^ Official Mopidy install for Debian/Ubuntu along with some extensions ^
#   (see https://docs.mopidy.com/en/latest/installation/debian/)
#
# copy defaults & s6-overlay stuff
COPY root/ /

# ports ###########################################################################################
# mopidy-http default port
EXPOSE 6680
# mpd plugin default port
EXPOSE 6600
# volumes #########################################################################################
VOLUME /config /music /data
