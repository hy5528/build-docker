FROM python:3.13-alpine AS base

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
    &&  python3 -m pip install --no-cache-dir --upgrade pip \
    && sudo python3 -m pip install --no-cache-dir --requirement requirements.txt \
    && apk del build-dependencies \
    ;

ENV XDG_CACHE_DIR=/root/.cache
ENV XDG_CONFIG_DIR=/root/.config
ENV XDG_DATA_DIR=/root/.local/share


# See https://docs.mopidy.com/latest/command/
ENTRYPOINT ["mopidy"]
