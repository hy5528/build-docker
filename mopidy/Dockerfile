FROM ghcr.io/linuxserver/baseimage-alpine:edge

# set version label
ARG BUILD_DATE
ARG VERSION
ARG MOPIDY_RELEASE

LABEL build_version="version:- ${VERSION} Build-date:- ${BUILD_DATE}"
LABEL maintainer="sweisgerber"
#
# Alpine Mopidy install along with some extensions #################################################
#
&& mkdir -p ~/.config/pip && printf "[global]\nbreak-system-packages = true\n" | tee ~/.config/pip/pip.conf \
 && pip install \
    alsa-utils \
    build-base \
    cairo \
    cairo-dev \
    dbus \
    dbus-dev \
    gobject-introspection \
    gobject-introspection-dev \
    gstreamer \
    gstreamer-dev \
    gst-plugins-base \
    gst-plugins-good \
    gst-plugins-ugly \
    gst-vaapi \
    libxml2 \
    python3 \
    python3-dev \
    py3-pip \
    py3-virtualenv \
    sudo
RUN python3 -m venv /lsiopy \
 && pip install -U --no-cache-dir pip wheel setuptools \
 && echo "**** install mopidy extensions ****" \
 && pip install --no-cache-dir --upgrade \
    Mopidy-Mobile \
    Mopidy-Iris \
    Mopidy-Jellyfin \
    Mopidy-Local \
    Mopidy-MPD \
    Mopidy-Podcast \
    Mopidy-Scrobbler \
    Mopidy-Tidal \
    Mopidy-TuneIn \
    Mopidy-YTMusic \
    Mopidy==${MOPIDY_RELEASE} \
    PyGObject \
    dbus-python \
    pip \
    pycairo \
    pykka \
    requests \
    tornado \
  && echo "**** cleanup ****" \
  && rm -rf \
    /tmp/*
# copy defaults & s6-overlay stuff
RUN curl -L -o gst-plugin-spotify_${GST_PLUGIN_SPOTIFY_VERSION_FILE}_${ARCH}.deb https://github.com/kingosticks/gst-plugins-rs-build/releases/download/gst-plugin-spotify_${GST_PLUGIN_SPOTIFY_VERSION_PATH}/gst-plugin-spotify_${GST_PLUGIN_SPOTIFY_VERSION_FILE}_${ARCH}.deb \
 && dpkg -i gst-plugin-spotify_${GST_PLUGIN_SPOTIFY_VERSION_FILE}_${ARCH}.deb \
  ; apt update && apt -f install -y \
 && rm gst-plugin-spotify_${GST_PLUGIN_SPOTIFY_VERSION_FILE}_${ARCH}.deb \
 && curl -L -o libshout3_2.4.1-2_${ARCH}.deb http://ftp.de.debian.org/debian/pool/main/libs/libshout/libshout3_2.4.1-2_${ARCH}.deb \
 && dpkg -i libshout3_2.4.1-2_${ARCH}.deb \
  ; apt update && apt -f install -y \
 && rm libshout3_2.4.1-2_${ARCH}.deb
RUN sh -c 'echo "mopidy ALL=NOPASSWD: /usr/local/lib/python3.11/dist-packages/mopidy_iris/system.sh" >> /etc/sudoers'

USER mopidy

EXPOSE 6600
EXPOSE 6680
EXPOSE 5555/udp

ADD --chmod=755 ./start.sh /start.sh

ENTRYPOINT ["dumb-init", "--"]
CMD ["/start.sh"]

HEALTHCHECK --interval=60s --timeout=5s --retries=3 \
    CMD curl --connect-timeout 5 --silent --show-error --fail http://localhost:6680/ || exit 1
