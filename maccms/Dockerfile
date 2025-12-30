FROM php:7.4.33-apache-buster

RUN rm -f /etc/localtime && \
    ln -sv /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone
ENV TZ=Asia/Shanghai

RUN apt-get update && apt-get install -y \
    wget \
    pip3 \
    unzip \
    libzip-dev \
    libwebp-dev \
    libjpeg-dev \
    libpng-dev \
    libfreetype6-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install zip gd pdo_mysql \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

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
