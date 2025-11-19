FROM alpine:3

ARG VERSION

RUN apk update && \
    apk add flatpak 
RUN flatpak remote-add --user --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo 
RUN flatpak --user install -y flathub io.github.orontee.Argos 
RUN flatpak --user run io.github.orontee.Argos 
RUN set -ex && \
    apk add --no-cache mopidy


EXPOSE 6600 6680

ENTRYPOINT ["mopidy"]
