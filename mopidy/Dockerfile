FROM alpine:3

ARG VERSION

# Install GStreamer and other required Debian packages
RUN echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories \
 && apk update \
 && apk add --no-cache \
  dumb-init \
  shadow \
  sudo \
  git \
  alsa-utils \
  py3-pip \
  mopidy \
  Mopidy-Mpd


# Clone Iris from the repository and install in development mode.
# This allows a binding at "/iris" to map to your local folder for development, rather than
# installing using pip.
# Note: ADD helps prevent RUN caching issues. When HEAD changes in repo, our cache will be invalidated!
ADD https://api.github.com/repos/jaedb/Iris/git/refs/heads/master version.json
ENV IRIS_VERSION=develop
RUN git clone --depth 1 --single-branch -b ${IRIS_VERSION} https://github.com/jaedb/Iris.git /iris \
 && cd /iris \
 && sudo python3 setup.py install \
 && sudo sh -c 'echo "mopidy  ALL=NOPASSWD:   iris/mopidy_iris/system.sh" >> /etc/sudoers >> /etc/sudoers' 

 
ENV TZ=Asia/Shanghai

EXPOSE 6600 6680

ENTRYPOINT ["mopidy"]
