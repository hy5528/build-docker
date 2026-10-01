FROM shinsenter/phpfpm-apache:php7.4-alpine
# 安装nginx与PHP扩展
RUN apk add --no-cache nginx zip unzip curl bash \
    && docker-php-ext-install pdo_mysql gd opcache pcntl 2>/dev/null || true

# gd扩展依赖
RUN apk add --no-cache libpng-dev libjpeg-turbo-dev freetype-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd \
    || apk add --no-cache libpng libjpeg-turbo freetype



EXPOSE 80
