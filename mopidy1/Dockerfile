ARG BUILD_FROM
ARG ARCH=amd64

FROM ${BUILD_FROM:-debian:12-slim} AS base
ARG ARCH=amd64

ARG GST_PLUGIN_SPOTIFY_VERSION_PATH=0.15.0.alpha.1-3
ARG GST_PLUGIN_SPOTIFY_VERSION_FILE=0.15.0.alpha.1-3

RUN apt-get update \
 && apt-get install -y curl \
                       alsa-utils \
                       gstreamer1.0-plugins-bad \
                       python3-gst-1.0 \
                       python3-lxml \
                       python3-pip \
                       python3-setuptools \
                       python3-wheel \
                       libasound2-dev \
 && apt purge --auto-remove -y \
    gcc \
 && apt clean \
 && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* ~/.cache /root/.cache

RUN curl -L -o gst-plugin-spotify_${GST_PLUGIN_SPOTIFY_VERSION_FILE}_${ARCH}.deb https://github.com/kingosticks/gst-plugins-rs-build/releases/download/gst-plugin-spotify_${GST_PLUGIN_SPOTIFY_VERSION_PATH}/gst-plugin-spotify_${GST_PLUGIN_SPOTIFY_VERSION_FILE}_${ARCH}.deb \
 && dpkg -i gst-plugin-spotify_${GST_PLUGIN_SPOTIFY_VERSION_FILE}_${ARCH}.deb \
  ; apt update && apt -f install -y \
 && rm gst-plugin-spotify_${GST_PLUGIN_SPOTIFY_VERSION_FILE}_${ARCH}.deb 

ADD --chmod=755 ./requirements.txt /requirements.txt

# RUN pip3 install -r requirements.txt \
RUN pip3 install --break-system-packages -r requirements.txt \
 && rm -rf ~/.cache/pip

RUN update-ca-certificates --fresh

RUN mkdir /root/music

VOLUME ["/root/.cache/mopidy", "/root/.local/share/mopidy", "/root/music"]

ENV TZ=Europe/London

EXPOSE 6600 6680

ENTRYPOINT ["mopidy"]
