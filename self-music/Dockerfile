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
 && rm -rf /var/cache/apk/*

# Install Node, to build Iris JS application
RUN apk add nodejs npm

# Allow pip to install over system packages
ENV PIP_BREAK_SYSTEM_PACKAGES 1
RUN git clone https://github.com/zkeq/Self-music.git
cd Self-music
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000

cd ../frontend
pnpm install
pnpm dev
