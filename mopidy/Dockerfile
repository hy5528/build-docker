FROM alpine:3

ARG VERSION

RUN set -xe && \
    apk add --no-cache mopidy 
        mopidy 

EXPOSE 6600 6680

ENTRYPOINT ["mopidy"]
