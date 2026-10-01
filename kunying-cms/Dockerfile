# 坤影CMS Docker一键部署镜像
FROM shinsenter/phpfpm-apache:php7.4-alpine
# 安装nginx与PHP扩展
RUN apk add --no-cache nginx zip unzip curl bash \
    && docker-php-ext-install pdo_mysql gd opcache pcntl 2>/dev/null || true

# gd扩展依赖
RUN apk add --no-cache libpng-dev libjpeg-turbo-dev freetype-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd \
    || apk add --no-cache libpng libjpeg-turbo freetype

WORKDIR /var/www/html

RUN wget https://github.com/kungec/kunying-cms.git

# 目录权限
RUN chmod -R 755 /var/www/html \
    && chown -R www-data:www-data /var/www/html

RUN mkdir -p /var/www/html/datas \
    && chmod -R 777 /var/www/html/datas


EXPOSE 80
CMD ["php-fpm"]
