# For base image info see: https://hub.docker.com/_/debian
ARG DISTRO_VERSION=bookworm
FROM debian:${DISTRO_VERSION}-slim

# Restore arg after from:
# https://docs.docker.com/reference/dockerfile#understand-how-arg-and-from-interact
ARG DISTRO_VERSION

# Set language
ENV LANG=C.UTF-8

# Headless apt
ENV DEBIAN_FRONTEND=noninteractive

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

# For mopidy installion instructions, see:
#   https://docs.mopidy.com/stable/installation/debian
RUN mkdir -p /etc/apt/keyrings && \
    wget -q -O /etc/apt/keyrings/mopidy-archive-keyring.gpg \
        https://apt.mopidy.com/mopidy.gpg && \
    wget -q -O /etc/apt/sources.list.d/mopidy.list \
        https://apt.mopidy.com/${DISTRO_VERSION}.list

# For a list of extensions, see:
#   https://mopidy.com/ext/
RUN apt-get update && \
    apt-get upgrade -y --no-install-recommends && \
    apt-get install -y --no-install-recommends \
        mopidy \
        mopidy-local \
        mopidy-scrobbler

RUN python3 -m pip install --break-system-packages \
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
