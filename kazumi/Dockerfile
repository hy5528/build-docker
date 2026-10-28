# syntax=docker/dockerfile:1
FROM node:24-bookworm-slim AS hls-build
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential pkg-config patch ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /build
COPY native/hls ./native/hls
COPY scripts/build-hls.mjs ./scripts/build-hls.mjs
RUN node scripts/build-hls.mjs

FROM golang:1.26-bookworm AS ech-build
WORKDIR /build
COPY native/ech/ ./
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/kazumi-ech .

FROM node:24-bookworm-slim AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS build
COPY index.html vite.config.js ./
COPY src ./src
COPY shared ./shared
RUN npm run build

FROM node:24-bookworm-slim AS production-dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM node:24-bookworm-slim AS runtime
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000 DATA_DIR=/app/data PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV NODE_EXTRA_CA_CERTS=/app/server/certificates/sslcom-tls-issuing-rsa-r1.crt
WORKDIR /app
COPY --from=production-dependencies --chown=node:node /app/node_modules ./node_modules
# Only the headless shell is needed; no Flutter, display server or media player.
RUN ./node_modules/.bin/playwright install --with-deps --only-shell chromium \
    && apt-get update && apt-get install -y --no-install-recommends libnss3-tools openssl ca-certificates \
    && chmod -R a+rX /ms-playwright \
    && rm -rf /var/lib/apt/lists/*
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json LICENSE ./
COPY --chown=node:node server ./server
COPY --chown=node:node shared ./shared
COPY --from=ech-build --chown=node:node /out/kazumi-ech ./bin/kazumi-ech
COPY --from=hls-build --chown=node:node /build/bin/ ./bin/
COPY --chown=node:node native/hls ./native/hls
COPY --chown=node:node scripts/build-hls.mjs ./scripts/build-hls.mjs
COPY --from=ech-build --chown=node:node /usr/local/go/LICENSE ./bin/GO-LICENSE
# Node bundles its own roots; Go's TLS client needs the system CA bundle.
COPY --from=ech-build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --chown=node:node scripts/check-ech.mjs ./scripts/check-ech.mjs
COPY --chown=node:node scripts/update-metadata.mjs ./scripts/update-metadata.mjs
# Preserve the verified alternate issuer chain for Node and Chromium.
RUN openssl verify -purpose sslserver -CAfile /etc/ssl/certs/ca-certificates.crt \
      /app/server/certificates/sslcom-tls-issuing-rsa-r1.crt \
    && mkdir -p /home/node/.pki/nssdb /app/data \
    && certutil -N --empty-password -d sql:/home/node/.pki/nssdb \
    && certutil -A -d sql:/home/node/.pki/nssdb -n 'SSL.com TLS Issuing RSA CA R1' -t 'C,,' \
      -i /app/server/certificates/sslcom-tls-issuing-rsa-r1.crt \
    && chown -R node:node /home/node/.pki /app/data
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "server/index.js"]
