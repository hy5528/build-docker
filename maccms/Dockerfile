FROM php:7.4.33-apache-buster

RUN rm -f /etc/localtime && \
    ln -sv /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone
ENV TZ=Asia/Shanghai

ADD ./sources.list /etc/apt/sources.list
RUN apt-get update && \
    apt-get install -y tzdata bash python3 python3-pip \
    zip libzip-dev libpng-dev libwebp-dev libjpeg-dev libfreetype6-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    rm -rf /var/cache/apt/*

RUN docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp && \
    docker-php-ext-install pdo_mysql zip gd && \
    mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

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
