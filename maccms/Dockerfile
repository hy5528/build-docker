FROM patipark/php-fpm:7.4-sqlsrv

# Update packages and install Composer and required packages.
RUN apt-get update && apt-get install -y \
  curl \
  zip \
  python3 \
  python3-pip \
  unzip \
  git && \
  curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

ADD ./launcher /opt/launcher
RUN chmod +x /opt/launcher/launch.sh
RUN pip3 install -r /opt/launcher/requirements.txt --no-cache-dir --index-url https://pypi.tuna.tsinghua.edu.cn/simple/

ADD ./maccms10.zip /opt/
ADD ./conch.zip /opt/

ENV HV_RELEASE=true
ENV HV_HTTP_PORT=80

EXPOSE 80
VOLUME [ "/var/www/html" ]
VOLUME [ "/etc/launcher" ]

ENTRYPOINT [ "/opt/launcher/launch.sh" ]
