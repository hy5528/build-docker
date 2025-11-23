FROM node:20-alpine


WORKDIR /app

COPY . .
RUN apk add --no-cache python3 make g++ git
RUN cd app/frontend \
    && pnpm install \
    && pnpm dev


FROM alpine:3.22.2
WORKDIR /
# Install GStreamer and other required Debian packages
RUN echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories \
 && apk update \
 && apk add --no-cache \
  dumb-init \
  shadow \
  nodejs \
  git \
  npm \
  py3-pip \
 && rm -rf /var/cache/apk/*
 # Allow pip to install over system packages
ENV PIP_BREAK_SYSTEM_PACKAGES 1

# Install additional mopidy extensions and Python dependencies via pip
ADD --chmod=755 ./requirements.txt /requirements.txt
RUN pip install --break-system-packages -r requirements.txt 

# Create a staging area for default data to initialize volumes
RUN mkdir /defaults
ADD --chmod=755 ./config.yaml /defaults/config.yaml
ADD --chmod=755 ./music.db /defaults/music.db

# Copy configs
ADD --chmod=755 ./supervisord.conf /etc/supervisor/conf.d/supervisord.conf
ADD --chmod=755 ./nginx.standalone.conf /etc/nginx/sites-available/default

VOLUME /data

# Expose the port Nginx is listening on
EXPOSE 80

# Copy and set entrypoint
ADD --chmod=755 ./docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["docker-entrypoint.sh"]

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3000"]
