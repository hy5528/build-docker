FROM alpine

ENV PATH="/container/scripts:${PATH}"

ENV MYSQL_DEFAULTS_FILE /mysql-defaults.cnf

RUN apk add --no-cache  mysql \
                        mysql-client \
                        coreutils \
                        busybox-extras

VOLUME ["/var/lib/mysql/", "/var/mysql-backup"]
EXPOSE 3306

COPY . /container/

HEALTHCHECK CMD ["/container/scripts/docker-healthcheck.sh"]
ENTRYPOINT ["/container/scripts/entrypoint.sh"]

CMD [ "/usr/bin/mariadbd-safe", "--console", "--skip-networking=0", "--log-error=/dev/stderr" ]
