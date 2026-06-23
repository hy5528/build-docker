FROM node:22-slim
# Install packages
RUN apt-get update && \
    apt-get upgrade -y --no-install-recommends && \
    apt-get install -y --no-install-recommends \
        wget \
        python3 \
        pip \
        alsa-utils \
        gstreamer1.0-libav \
        gstreamer1.0-alsa

RUN python3 -m pip install --break-system-packages \
        mopidy \
        mopidy-local \ 
        Mopidy-Iris

# Create needed folders, see:
# https://docs.mopidy.com/stable/config/#core-configuration
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
EXPOSE ${EXPOSE_PORT}

# See https://docs.mopidy.com/latest/command/
CMD ["/usr/bin/mopidy"]
