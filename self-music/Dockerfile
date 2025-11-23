# Stage 1: Build the Next.js application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependency definition files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install


# Build-time argument for the API URL
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build the application
RUN pnpm build

# Stage 2: Production image
FROM node:18-alpine AS runner

# Copy necessary files from the builder stage
# Copy public assets
COPY --from=builder /app/public ./public
# Copy standalone server and static assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

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
ADD --chmod=755 ./supervisord /usr/bin/supervisord
VOLUME /data

# Expose the port Nginx is listening on
EXPOSE 80

# Copy and set entrypoint
ADD --chmod=755 ./docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["docker-entrypoint.sh"]

# Command to run the standalone server
CMD ["npx"]
