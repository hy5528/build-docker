FROM debian:11-slim 
RUN apt-get update && apt-get install -yq --no-install-recommends \
        curl \
        git \
        bash  \
    && rm -rf /var/lib/apt/lists/*

RUN bash <(curl -Lsv https://raw.githubusercontent.com/chourmovs/moode_debian/main/podman.sh)
RUN bash <(curl -Lsv https://raw.githubusercontent.com/chourmovs/moode_docker/main/moode_docker.sh)


