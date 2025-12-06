FROM --platform=$BUILDPLATFORM debian:11-slim AS build
RUN DEBIAN_FRONTEND=noninteractive && apt-get update && apt-get -y --no-install-recommends install  git build-essential curl bash && apt-get autoremove && apt-get clean
WORKDIR /app
ADD --chmod=755 ./moodeaudio-m8y_deb.sh /moodeaudio-m8y_deb.sh
ADD --chmod=755 ./moode-player_9.0.0-1moode1~pre1_all.deb /moode-player_9.0.0-1moode1~pre1_all.deb

RUN /moodeaudio-m8y_deb.sh
RUN apt install -y moode-player_9.0.0-1moode1~pre1_all.deb
