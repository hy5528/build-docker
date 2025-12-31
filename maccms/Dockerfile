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
    unzip 
 
RUN apk add libwebp-dev libjpeg-turbo-dev libpng-dev  freetype-dev
RUN docker-php-ext-configure gd --with-webp-dir --with-jpeg-dir --with-png-dir --with-zlib-dir --with-freetype-dir
RUN docker-php-ext-install gd

# zip 扩展
RUN apk add libzip-dev && docker-php-ext-install zip

# Mysqli 扩展 自带 直接安装即可(当前数据库使用的mysqli查询的)
RUN docker-php-ext-install mysqli
# PDO 扩展 自带 直接安装即可
RUN docker-php-ext-install pdo_mysql
# Bcmath 扩展 自带 直接安装即可
RUN docker-php-ext-install bcmath
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
