FROM debian:11-slim 
RUN apt-get update && apt-get install -yq --no-install-recommends \
        curl \
        git \
    && rm -rf /var/lib/apt/lists/*

RUN wget https://raw.githubusercontent.com/chourmovs/moode_debian/main/podman.sh \
    bash podman.sh
RUN wget https://raw.githubusercontent.com/chourmovs/moode_docker/main/moode_docker.sh 
    bash moode_docker.sh 

