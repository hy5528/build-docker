FROM --platform=$BUILDPLATFORM node:22-alpine AS build

# install pnpm


WORKDIR /app

COPY package.json ./

# skip postinstall
RUN npm install 

COPY . .

RUN npm run build 
# app

FROM nginx:1.29.3-alpine3.22-slim AS app


COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80 

CMD ["nginx", "-g", "daemon off;"]
