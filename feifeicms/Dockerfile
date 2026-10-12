FROM composer:2.8.12 AS composer

FROM php:8.5.10-fpm-alpine3.23

RUN apk add --no-cache \
        icu-libs libjpeg-turbo libpng libwebp libzip unzip \
    && apk add --no-cache --virtual .build-deps \
        icu-dev libjpeg-turbo-dev libpng-dev libwebp-dev libzip-dev $PHPIZE_DEPS \
    && docker-php-ext-configure gd --with-jpeg --with-webp \
    && docker-php-ext-install -j"$(nproc)" gd intl pdo_mysql zip \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del .build-deps

COPY --from=composer /usr/bin/composer /usr/local/bin/composer
WORKDIR /var/www/html
COPY composer.json composer.lock* ./
RUN composer install --no-dev --no-interaction --prefer-dist --no-scripts --no-autoloader
COPY . .
RUN composer dump-autoload --no-dev --optimize \
    && mkdir -p runtime public/uploads \
    && chown -R www-data:www-data runtime public/uploads

USER www-data
EXPOSE 9000
CMD ["php-fpm"]
