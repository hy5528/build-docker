# phpfpm-apache:php7.4-alpine

```text
docker run -d --name phpfpm  --restart=always --user $(id -u):$(id -g) -v /www/cms:/var/www/html  -p 3600:80 -e ND_LOGLEVEL=info  ghcr.io/hy5528/phpfpm-apache:php8.5-alpine

```
