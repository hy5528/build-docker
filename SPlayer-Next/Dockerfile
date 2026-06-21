# build
FROM --platform=$BUILDPLATFORM node:22-alpine AS builder
RUN apk add --no-cache npm python3
# install pnpm
RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

# skip postinstall
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .

# add .env.example to .env
# RUN [ ! -e ".env" ] && cp .env.example .env || true

# skip native build for web deployment
ENV SKIP_NATIVE_BUILD=true
RUN pnpm build

# nginx
FROM nginx:1.27-alpine-slim 
COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/out/renderer /usr/share/nginx/html


ENV NODE_TLS_REJECT_UNAUTHORIZED=0

CMD ["npm", "start"]
