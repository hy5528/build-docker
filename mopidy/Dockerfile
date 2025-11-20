# Use Alpine edge for now as some required dependencies are only in the testing repository
FROM --platform=$BUILDPLATFORM python:3.12-alpine
LABEL org.opencontainers.image.authors="https://github.com/jaedb"

# Switch to the root user while we do our changes
USER root
WORKDIR /

# Install GStreamer and other required Debian packages
RUN echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories \
 && apk update \
 && apk add \
  dumb-init \
  shadow \
  sudo \
  git \
  alsa-utils \
  py3-pip \
  mopidy \
  py3-mopidy-spotify



# Clone Iris from the repository and install in development mode.
# This allows a binding at "/iris" to map to your local folder for development, rather than
# installing using pip.
# Note: ADD helps prevent RUN caching issues. When HEAD changes in repo, our cache will be invalidated!
ADD https://api.github.com/repos/jaedb/Iris/git/refs/heads/master version.json
ENV IRIS_VERSION=develop
RUN git clone --depth 1 --single-branch -b ${IRIS_VERSION} https://github.com/jaedb/Iris.git /iris \
 && cd /iris \
 && npm install \
 && npm run prod \
 && python3 setup.py develop 
 
ENV TZ=Asia/Shanghai

EXPOSE 6600 6680

ENTRYPOINT ["mopidy"]
