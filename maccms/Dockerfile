FROM php:7.4-fpm

RUN rm -f /etc/localtime && \
    ln -sv /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone
ENV TZ=Asia/Shanghai

# Install system dependencies required for PHP extensions, including GD
RUN apt-get update && apt-get install -y \
    libzip-dev \
    python3-pip \
    libcurl4-openssl-dev \
    libxml2-dev \
    libonig-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    unzip \
    zip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) pdo pdo_mysql zip fileinfo curl xml mbstring gd \
    && docker-php-ext-enable opcache gd \
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
