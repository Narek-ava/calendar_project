FROM php:7.4-cli-alpine

RUN apk add --no-cache $PHPIZE_DEPS bash postgresql-dev zip libzip-dev libpng libpng-dev fcgi imap-dev krb5-dev \
    && pecl install -o -f mailparse \
    && docker-php-ext-configure pgsql -with-pgsql=/usr/local/pgsql \
    && docker-php-ext-configure imap --with-kerberos --with-imap-ssl \
    && docker-php-ext-configure zip \
    && docker-php-ext-install pdo_pgsql zip imap gd \
    && docker-php-ext-enable imap mailparse

RUN apk add --no-cache unzip

RUN mv $PHP_INI_DIR/php.ini-development $PHP_INI_DIR/php.ini

COPY ./common/php/conf.d /usr/local/etc/php/conf.d
COPY ./local/php/conf.d /usr/local/etc/php/conf.d

COPY ./common/wait-for-it.sh /usr/local/bin/wait-for-it
RUN chmod 555 /usr/local/bin/wait-for-it

ENV COMPOSER_ALLOW_SUPERUSER 1

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/bin --filename=composer --quiet

WORKDIR /app
