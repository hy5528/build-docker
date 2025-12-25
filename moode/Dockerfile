FROM debian:11-slim 
RUN apt-get update && apt-get install -yq --no-install-recommends \
        curl \
        git \
    && rm -rf /var/lib/apt/lists/*

RUN ./podman.sh
RUN ./moode_docker.sh
