FROM php:8.1-cli-alpine3.15 AS builder

RUN apk update \
    && apk add --no-cache postgresql-dev \
    unzip \
    freetype-dev libjpeg-turbo-dev libpng-dev libzip-dev zlib-dev \
    zip \
    gmp gmp-dev \
    php8-bcmath \
    && docker-php-ext-configure pgsql -with-pgsql=/usr/local/pgsql \
    && docker-php-ext-install pdo_pgsql opcache \
    && docker-php-ext-configure gd --enable-gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd \
    && docker-php-ext-install zip gmp bcmath

ENV COMPOSER_ALLOW_SUPERUSER 1

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/bin --filename=composer --quiet

WORKDIR /app

COPY ./packages ./packages
COPY ./composer.json ./composer.lock ./

RUN composer install --no-scripts --prefer-dist --no-progress --no-suggest --optimize-autoloader \
    && rm -rf /root/.composer/cache

### CLI ###

FROM php:8.1-cli-alpine3.15

RUN apk add --no-cache pcre-dev $PHPIZE_DEPS postgresql-dev postgresql-client bash coreutils imagemagick imagemagick-dev gmp gmp-dev php8-bcmath \
    && pecl install -o -f redis imagick \
    && docker-php-ext-enable redis.so imagick \
    && docker-php-ext-configure pgsql -with-pgsql=/usr/local/pgsql \
    && docker-php-ext-install pdo_pgsql opcache \
    && docker-php-ext-install gmp \
    && docker-php-ext-install bcmath

RUN mv $PHP_INI_DIR/php.ini-production $PHP_INI_DIR/php.ini

COPY ./docker/common/php/conf.d /usr/local/etc/php/conf.d
COPY ./docker/production/php/conf.d /usr/local/etc/php/conf.d

COPY ./docker/common/wait-for-it.sh /usr/local/bin/wait-for-it
RUN chmod 555 /usr/local/bin/wait-for-it

WORKDIR /app

COPY --from=builder /app ./
COPY ./ ./
