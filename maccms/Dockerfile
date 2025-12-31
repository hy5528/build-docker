FROM shinsenter/phpfpm-apache:dev-php7.4
ADD https://github.com/hy5528/build-Openwrt-Armbian/releases/download/20250523/maccms.zip .
RUN apt-get update && \
    apt-get install -y unzip && \
    rm -rf /var/lib/apt/lists/*  && \
    docker-php-ext-install pdo_mysql mysqli && \
    unzip maccms.zip && \
    mv maccms/* /var/www/html/ && \
    rm -r maccms maccms.zip


ENV HV_RELEASE=true
ENV HV_HTTP_PORT=80

EXPOSE 80
VOLUME [ "/var/www/html" ]

