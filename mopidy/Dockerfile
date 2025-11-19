FROM --platform=$BUILDPLATFORM golang:alpine AS builder

RUN apk add --no-cache mopidy
RUN apk add --no-cache Mopidy-Iris

EXPOSE 6600 6680

ENTRYPOINT ["mopidy"]
