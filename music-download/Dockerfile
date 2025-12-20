FROM --platform=$BUILDPLATFORM node:20-alpine AS build



WORKDIR /app

COPY . .

RUN apk add --no-cache python3 make g++ git \
    && yarn install --frozen-lockfile \
    && yarn build

# app

FROM nginx:1.29.3-alpine3.22-slim AS app


COPY --from=builder /app/out/renderer /usr/share/nginx/html
EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
