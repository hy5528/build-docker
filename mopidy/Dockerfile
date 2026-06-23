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
    && python3 -m pip install --no-cache-dir --upgrade pip \
    && python3 -m pip install --no-cache-dir --requirement requirements.txt \
    && apk del build-dependencies \
    ;

#COPY docker-entrypoint.sh .
ADD --chmod=755 docker-entrypoint.sh .

ENTRYPOINT [ "/usr/local/src/mopidy/docker-entrypoint.sh" ]
CMD [ "/usr/local/bin/mopidy", "--config", "/mopidy/config" ]

FROM base AS youtube

RUN apk add --no-cache --virtual build-dependencies python3-dev gcc libc-dev \
        cairo-dev gobject-introspection gobject-introspection-dev \
    && apk add --no-cache deno \
    && python3 -m pip install --no-cache-dir --upgrade pip \
    && python3 -m pip install --no-cache-dir "setuptools<71" \
    && python3 -m pip install --no-cache-dir \
        Mopidy-MPD \
    && apk del build-dependencies \
    ;

FROM base AS core
