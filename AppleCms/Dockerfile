FROM php:8.4-cli-bookworm

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    libicu-dev \
    libonig-dev \
    libxml2-dev \
    unzip \
    git \
    curl \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        gd \
        zip \
        intl \
        mbstring \
        pdo_mysql \
        bcmath \
        opcache \
        pcntl \
        sodium \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html
RUN composer install --no-dev --optimize-autoloader
EXPOSE 8010

CMD ["sh", "docker/php/start.sh"]
