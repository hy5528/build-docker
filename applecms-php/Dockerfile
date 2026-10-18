FROM php:8.4-fpm-alpine

# 安装nginx与PHP扩展(curl/mbstring官方镜像已内置;zip供插件/升级包解压)
RUN apk add --no-cache nginx zip unzip git curl bash libzip-dev \
    && docker-php-ext-install pdo_mysql gd opcache pcntl zip

# gd扩展依赖
RUN apk add --no-cache libpng-dev libjpeg-turbo-dev freetype-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd \
    || apk add --no-cache libpng libjpeg-turbo freetype

# 安装 Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

WORKDIR /var/www/html
EXPOSE 80
