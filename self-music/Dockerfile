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
COPY --from=frontend-builder /app/.next/standalone ./
COPY --from=frontend-builder /app/.next/static ./.next/static

# Stage 2: Final image
FROM alpine:3.22.2
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

WORKDIR /app

# Copy backend
COPY backend/ /app/backend/
RUN pip3 install --no-cache-dir -r /app/backend/requirements.txt

# Create a staging area for default data to initialize volumes
RUN mkdir /defaults
COPY backend/config.yaml /defaults/
COPY backend/music.db /defaults/

# Copy built frontend
COPY --from=frontend-builder /app/public /app/frontend/public
COPY --from=frontend-builder /app/.next/standalone /app/frontend/
COPY --from=frontend-builder /app/.next/static /app/frontend/.next/static

# Copy configs
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY nginx.standalone.conf /etc/nginx/sites-available/default

# Remove original files and create symlinks for data persistence.
# The entrypoint script will ensure the target files/dirs exist at runtime.
RUN rm /app/backend/music.db /app/backend/config.yaml && \
    rm -rf /app/backend/uploads && \
    ln -s /data/music.db /app/backend/music.db && \
    ln -s /data/config.yaml /app/backend/config.yaml && \
    ln -s /data/uploads /app/backend/uploads

VOLUME /data

# Expose the port the app runs on
EXPOSE 3000

# Set the environment variable for the port
ENV PORT=3000

# Command to run the standalone server
CMD ["node", "server.js"]
