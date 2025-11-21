FROM alpine:3.22.2

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
 && rm -rf /var/cache/apk/*
# Install Node, to build Iris JS application
RUN apk add --no-cache nodejs npm

# Allow pip to install over system packages
ENV PIP_BREAK_SYSTEM_PACKAGES 1
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
 && python3 setup.py develop \
  && echo "mopidy ALL=NOPASSWD: /iris/mopidy_iris/system.sh" >> /etc/sudoers \
 # Enable container mode (disable restart option, etc.)
 && echo "1" >> /IS_CONTAINER \
 # Copy Version file
 && cp /iris/VERSION /
 
ADD --chmod=755 ./requirements.txt /requirements.txt

# RUN pip3 install -r requirements.txt \
RUN pip install --break-system-packages -r requirements.txt

# Cleanup
RUN rm -rf /root/.cache \
 && rm -rf /iris/node_modules

 
ENV TZ=Asia/Shanghai

EXPOSE 6600 6680

ENTRYPOINT ["mopidy"]
