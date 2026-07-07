FROM --platform=$BUILDPLATFORM node:22-alpine AS builder

RUN apk add --no-cache python3
WORKDIR /app
RUN python -m http.server 8000 
