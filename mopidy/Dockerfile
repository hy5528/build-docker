FROM alpine:3

ARG VERSION

RUN apk update && \
    apk add flatpak 
RUN flatpak remote-add --user --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo 
RUN flatpak install flathub io.github.orontee.Argos 
RUN flatpak run io.github.orontee.Argos 
RUN apk add --no-cache mopidy


EXPOSE 6600 6680

ENTRYPOINT ["mopidy"]
