FROM php:7.4.33-apache-buster

RUN rm -f /etc/localtime && \
    ln -sv /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone
ENV TZ=Asia/Shanghai

RUN set -ex \
    && apt-get update && apt-get install -y \
       git \
       unzip \
       libfreetype-dev \
       libjpeg-dev \
       libwebp-dev \
       libzip-dev \
    && docker-php-ext-install -j$(nproc) mysqli pdo_mysql sockets zip \
    && docker-php-ext-configure gd \
        --with-freetype \
        --with-jpeg \
        --with-webp \
    && docker-php-ext-install -j$(nproc) gd \
    && apt-get autoremove -y \
    && apt-get clean \
    && rm -rf /tmp/* /var/lib/apt/lists/*

RUN set -ex \
    && mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini" \
    && a2enmod remoteip \
    && sed -i 's/%h/%a/g' /etc/apache2/apache2.conf \
    && echo "ServerName localhost" >> /etc/apache2/apache2.conf

COPY <<EOT /etc/apache2/mods-enabled/remoteip.conf
RemoteIPHeader X-Forwarded-For
RemoteIPTrustedProxy 127.0.0.0/8
RemoteIPTrustedProxy ::1/128
EOT
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
