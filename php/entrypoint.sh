#! /bin/sh
#
# entrypoint.sh

set -e

[[ "$DEBUG" == "true" ]] && set -x


mkdir -p /var/www

addgroup -g ${GID} -S phpgroup && adduser -u ${UID} -G phpgroup -H -D -s /sbin/nologin phpuser

[[ $(stat -c %U /var/www) == "phpuser" ]] || chown -R phpuser /var/www
[[ $(stat -c %G /var/www) == "phpgroup" ]] || chgrp -R phpgroup /var/www

exec "$@"
