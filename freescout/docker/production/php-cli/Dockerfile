FROM php:7.4-cli-alpine AS builder

RUN apk add --no-cache bash postgresql-dev zip libzip-dev libpng libpng-dev fcgi imap-dev krb5-dev \
    && docker-php-ext-configure pgsql -with-pgsql=/usr/local/pgsql \
    && docker-php-ext-configure imap --with-kerberos --with-imap-ssl \
    && docker-php-ext-configure zip \
    && docker-php-ext-install pdo_pgsql zip imap gd \
    && docker-php-ext-enable imap

RUN apk add --no-cache unzip

ENV COMPOSER_ALLOW_SUPERUSER 1

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/bin --filename=composer --quiet

WORKDIR /app

COPY ./composer.json ./composer.lock ./
ADD ./database/ ./database

RUN composer install --no-scripts --prefer-dist --no-progress --no-suggest --optimize-autoloader \
    && rm -rf /root/.composer/cache

### CLI ###

FROM php:7.4-cli-alpine

RUN apk add --no-cache $PHPIZE_DEPS bash postgresql-dev zip libzip-dev libpng libpng-dev fcgi imap-dev krb5-dev \
    && pecl install -o -f redis mailparse \
    && docker-php-ext-enable redis.so \
    && docker-php-ext-configure pgsql -with-pgsql=/usr/local/pgsql \
    && docker-php-ext-configure imap --with-kerberos --with-imap-ssl \
    && docker-php-ext-configure zip \
    && docker-php-ext-install pdo_pgsql zip imap gd \
    && docker-php-ext-enable imap mailparse

RUN mv $PHP_INI_DIR/php.ini-production $PHP_INI_DIR/php.ini

COPY ./docker/common/php/conf.d /usr/local/etc/php/conf.d
COPY ./docker/production/php/conf.d /usr/local/etc/php/conf.d

COPY ./docker/common/wait-for-it.sh /usr/local/bin/wait-for-it
RUN chmod 555 /usr/local/bin/wait-for-it

WORKDIR /app

COPY --from=builder /app ./
COPY ./ ./
