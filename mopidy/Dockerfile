FROM alpine:3

ARG VERSION

RUN apk update && \
    apk add python3 py3-pip flatpak

RUN apk add --no-cache mopidy

RUN flatpak install flathub io.github.orontee.Argos

RUN flatpak run io.github.orontee.Argos



EXPOSE 6600 6680

ENTRYPOINT ["mopidy"]
