FROM alpine:3

ARG VERSION

RUN apk update && \
    apk add python3 py3-pip

RUN pip3 install mopidy

RUN pip3 install Mopidy-Iris




EXPOSE 6600 6680

ENTRYPOINT ["mopidy"]
