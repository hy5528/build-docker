FROM --platform=$BUILDPLATFORM node:22-alpine AS build


WORKDIR /app
# 复制package文件
COPY package*.json ./
COPY . .

RUN yarn install \
    && yarn build

# app

FROM nginx:1.29.3-alpine3.22-slim AS app


COPY --from=build /app/docker/nginx.conf.example /etc/nginx/http.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80 

CMD ["nginx", "-g", "daemon off;"]
