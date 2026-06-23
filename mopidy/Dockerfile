FROM python:3.14.6-alpine AS base

WORKDIR /usr/local/src/mopidy

# Install Mopidy requirements
RUN --mount=type=bind,source=requirements.txt,target=requirements.txt \
    apk add --no-cache --virtual build-dependencies python3-dev gcc libc-dev \
    cairo-dev gobject-introspection gobject-introspection-dev \
    && apk add --no-cache \
        git \
        gstreamer \
        py3-gobject3 \
        py3-gst \
        su-exec \
        gst-plugins-bad \
        gst-plugins-good \
        gst-plugins-ugly \
    && python3 -m pip install --no-cache-dir --upgrade pip \
    && python3 -m pip install --no-cache-dir --requirement requirements.txt \
    && apk del build-dependencies \
    ;

RUN python3 -m pip install --break-system-packages mopidy-mpd \
        Mopidy-Iris \
        Mopidy-Mobile \
        Mopidy-Local \
    && apk del build-dependencies \
    ;

ENV XDG_CACHE_DIR=/root/.cache
ENV XDG_CONFIG_DIR=/root/.config
ENV XDG_DATA_DIR=/root/.local/share
RUN mkdir /cache && \
    mkdir /config && \
    mkdir /data && \
    mkdir /iris && \
    mkdir -p $XDG_CACHE_DIR && \
    mkdir -p $XDG_CONFIG_DIR && \
    mkdir -p $XDG_DATA_DIR && \
    ln -s /cache ${XDG_CACHE_DIR}/mopidy && \
    ln -s /config ${XDG_CONFIG_DIR}/mopidy && \
    ln -s /data ${XDG_DATA_DIR}/mopidy && \
    ln -s /iris ${XDG_DATA_DIR}/iris

# Port that mopidy listens on
EXPOSE 8088

# See https://docs.mopidy.com/latest/command/
CMD ["/usr/bin/mopidy"]
