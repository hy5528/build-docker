# build
FROM --platform=$BUILDPLATFORM node:22-alpine AS builder

# install pnpm
RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

# skip postinstall
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .


RUN pnpm run build

FROM nginx:1.29.3-alpine3.22-slim AS app

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80 

CMD ["nginx", "-g", "daemon off;"]
