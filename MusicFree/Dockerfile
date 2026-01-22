FROM alpine:3

ARG VERSION

RUN set -eux; \
    apk --no-cache add \
        npm 
WORKDIR /app
RUN npm install
RUN npm start


EXPOSE 80

CMD [ "--no-daemon", "--stdout"]
