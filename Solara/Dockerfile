FROM --platform=$BUILDPLATFORM node:20-alpine AS builder
WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:1.29.3-alpine3.22-slim AS app

WORKDIR /app


COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 3001

CMD ["npm", "run", "start"]
