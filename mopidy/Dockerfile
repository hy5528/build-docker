FROM alpine:3

ARG VERSION

RUN set -ex 
RUN apk add --no-cache mopidy
RUN apk add --no-cache Mopidy-Iris

EXPOSE 6600 6680

ENTRYPOINT ["mopidy"]
