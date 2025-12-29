FROM php:8.5.0RC1-fpm

WORKDIR /var/www/html

RUN apt-get update && apt-get install -y \
    wget \
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

RUN wget -O maccms10.zip https://github.com/magicblack/maccms10/archive/refs/heads/master.zip \
    && unzip maccms10.zip \
    && mv maccms10-master/* . \
    && mv maccms10-master/.* . 2>/dev/null || true \
    && rm -rf maccms10-master maccms10.zip

RUN chmod -R 755 /var/www/html \
    && chown -R www-data:www-data /var/www/html

RUN mkdir -p /var/www/html/datas \
    && chmod -R 777 /var/www/html/datas

EXPOSE 9000

CMD ["php-fpm"]