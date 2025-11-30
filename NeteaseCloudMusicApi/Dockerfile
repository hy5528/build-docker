FROM --platform=$BUILDPLATFORM node:22-alpine AS app

RUN apk add --no-cache nginx && npm i -g @neteasecloudmusicapienhanced/api
RUN apk add --no-cache nginx && npm i -g @unblockneteasemusic/server
COPY --from=build /app/docker/nginx.conf.example /etc/nginx/http.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html


EXPOSE 3000

CMD ["node", "app.js" ]
