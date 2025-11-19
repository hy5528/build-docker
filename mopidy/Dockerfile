FROM --platform=$BUILDPLATFORM golang:alpine AS builder

RUN apk add --no-cache python3 py3-pip mopidy mopidy-spotify mopidy-local Mopidy-Iris

EXPOSE 6600 6680

ENTRYPOINT ["mopidy"]
