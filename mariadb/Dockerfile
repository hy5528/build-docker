FROM alpine:3.24

# set version label
ARG BUILD_DATE
ARG VERSION
ARG MARIADB_VERSION
LABEL build_version="Linuxserver.io version:- ${VERSION} Build-date:- ${BUILD_DATE}"
LABEL maintainer="thelamer,nemchik"

# environment variables
ENV MYSQL_DIR="/config"
ENV DATADIR="$MYSQL_DIR/databases"

RUN apk add --no-cache \
    gnupg \
    logrotate \
    mariadb==${MARIADB_VERSION} \
    mariadb-backup==${MARIADB_VERSION} \
    mariadb-client==${MARIADB_VERSION} \
    mariadb-common==${MARIADB_VERSION} \
    mariadb-server-utils==${MARIADB_VERSION} && \
  printf "Linuxserver.io version: ${VERSION}\nBuild-date: ${BUILD_DATE}" > /build_version && \
  echo "**** cleanup ****" && \
  rm -rf \
    /tmp/* \
    $HOME/.cache

# copy local files
COPY root/ /

# ports and volumes
EXPOSE 3306

VOLUME /config
