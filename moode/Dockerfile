FROM debian:11-slim 
RUN apt-get update && apt-get install -yq --no-install-recommends \
        curl \
        git \
    && rm -rf /var/lib/apt/lists/*
ADD --chmod=755 ./podman.sh /podman.sh
ADD --chmod=755 ./moode_docker.sh /moode_docker.sh
RUN bash podman.sh
RUN bash moode_docker.sh
