FROM --platform=$BUILDPLATFORM node:16.13.1-alpine AS build

RUN apk add --no-cache python3 make g++ git 
WORKDIR /app

COPY package*.json ./
RUN npm install
    
COPY . .
RUN npm run build
# app

FROM nginx:1.29.3-alpine3.22-slim AS app


COPY --from=build /app/docker/nginx.conf.example /etc/nginx/http.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80 

CMD ["nginx", "-g", "daemon off;"]
