FROM alpine:3

ARG VERSION

RUN apk update && \
    apk add flatpak && \
    $ flatpak remote-add --user --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo

RUN apk add --no-cache mopidy

RUN flatpak install flathub io.github.varlad77.Argos


RUN flatpak run io.github.varlad77.Argos



EXPOSE 6600 6680

ENTRYPOINT ["mopidy"]
