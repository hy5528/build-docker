#!/bin/sh
set -o errexit

work_dir="$(dirname $(readlink -f $0))"
cd "$work_dir"

if [ ! -f "/var/www/html/initialized" ]; then
    rm -rf /var/www/html/*
    rm -rf /tmp/maccms10-master && unzip -d /tmp /opt/maccms10.zip
    mv /tmp/maccms10-master/* /var/www/html/ && rm -rf /tmp/maccms10-master
    unzip -d /var/www/html/template /opt/conch.zip
    mv /var/www/html/admin.php /var/www/html/maccmsadmin.php
    chown -R www-data: /var/www/html
    touch /var/www/html/initialized
fi

echo "setup"
python3 "$work_dir/setup.py"

echo "launch"
exec "docker-php-entrypoint" "apache2-foreground"
