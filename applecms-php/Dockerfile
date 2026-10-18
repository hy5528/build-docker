FROM php:8.4-fpm-alpine

# 安装系统依赖和 PHP 扩展
RUN apk add --no-cache \
    zip \
    unzip \
    git \
    curl \
    bash \
    libzip-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) pdo_mysql gd opcache bcmath pcntl zip \
    && apk del libpng-dev libjpeg-turbo-dev freetype-dev libzip-dev \
    && rm -rf /var/cache/apk/*

# 安装 Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

WORKDIR /var/www/html
EXPOSE 80
