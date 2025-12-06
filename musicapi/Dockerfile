FROM --platform=$BUILDPLATFORM debian:11-slim AS build
RUN DEBIAN_FRONTEND=noninteractive && apt-get update && apt-get upgrade -y && apt-get -y --no-install-recommends install sudo git build-essential autoconf cmake libtool python3 libssl-dev clang curl bash && apt-get autoremove && apt-get clean
RUN chmod +x podman.sh
RUN chmod +x moode_docker.sh
RUN ./podman.sh
RUN ./moode_docker.sh
