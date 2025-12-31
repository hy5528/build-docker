FROM php:7.4-fpm-alpine

RUN echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories \
 && apk update \
 && apk add --no-cache \
     curl \
     sudo \
     wget \
     git \
     zip \
     libmemcached-dev \
		g++ \
		pcre \
		gcc \
		autoconf \
		automake \
		make \
		zlib-dev \
		openssl \
    unzip \
    zip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) pdo pdo_mysql zip fileinfo curl xml mbstring gd \
    && docker-php-ext-enable opcache gd \
    && rm -rf /var/lib/apt/lists/*
COPY / /var/www/html
RUN chown -R www-data:www-data /var/www/html
# Set working directory (adjust if needed)
WORKDIR /var/www/html

# Copy composer from official image (optional if you use composer)
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

EXPOSE 9000
VOLUME /var/www/html
CMD ["php-fpm"]
