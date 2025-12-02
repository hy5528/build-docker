FROM --platform=$BUILDPLATFORM node:18-alpine as builder

RUN apk add --no-cache git python3 make g++

WORKDIR /app

WORKDIR /app

RUN git clone --recurse-submodules https://github.com/Dos7t3r/Vue-mmPlayer.git 

RUN cd Vue-mmPlayer \
	&& echo 'VUE_APP_BASE_API_URL = /api' > .env \
	&& npm install  \
	&& npm run build 


FROM nginx:alpine


COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

ENV NODE_ENV=production

EXPOSE 80 

CMD ["/entrypoint.sh"]




