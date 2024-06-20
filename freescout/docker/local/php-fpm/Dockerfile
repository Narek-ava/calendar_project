FROM php:7.4-fpm-alpine

RUN apk add --no-cache $PHPIZE_DEPS bash postgresql-dev zip libzip-dev libpng libpng-dev fcgi imap-dev krb5-dev \
    && pecl install -o -f mailparse \
    && docker-php-ext-configure pgsql -with-pgsql=/usr/local/pgsql \
    && docker-php-ext-configure imap --with-kerberos --with-imap-ssl \
    && docker-php-ext-configure zip \
    && docker-php-ext-install pdo_pgsql zip imap gd \
    && docker-php-ext-enable imap mailparse

RUN mv $PHP_INI_DIR/php.ini-development $PHP_INI_DIR/php.ini

COPY ./common/php/conf.d /usr/local/etc/php/conf.d
COPY ./common/php/php-fpm.d /usr/local/etc/php-fpm.d
COPY ./local/php/conf.d /usr/local/etc/php/conf.d
COPY ./local/php-fpm/conf.d /usr/local/etc/php/conf.d

WORKDIR /app

COPY ./local/php-fpm/entrypoint.sh /usr/local/bin/docker-php-entrypoint
RUN chmod +x /usr/local/bin/docker-php-entrypoint

HEALTHCHECK --interval=5s --timeout=3s --start-period=1s \
    CMD REDIRECT_STATUS=true SCRIPT_NAME=/ping SCRIPT_FILENAME=/ping REQUEST_METHOD=GET \
    cgi-fcgi -bind -connect 127.0.0.1:9000 || exit 1
