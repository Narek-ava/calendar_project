FROM php:8.1-cli-alpine3.15

ENV XDEBUG_VERSION 3.1.3

RUN apk add --no-cache pcre-dev $PHPIZE_DEPS postgresql-dev postgresql-client bash coreutils git imagemagick imagemagick-dev \
    unzip \
    freetype-dev libjpeg-turbo-dev libpng-dev libzip-dev zlib-dev \
    zip \
    gmp gmp-dev \
    php8-bcmath \
    && pecl install -o -f redis imagick \
    && docker-php-ext-enable redis.so imagick \
    && docker-php-ext-configure pgsql -with-pgsql=/usr/local/pgsql \
    && git clone --branch $XDEBUG_VERSION --depth 1 https://github.com/xdebug/xdebug.git /usr/src/php/ext/xdebug \
    && docker-php-ext-configure xdebug --enable-xdebug-dev \
    && docker-php-ext-install pdo_pgsql xdebug \
    && docker-php-ext-configure gd --enable-gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd \
    && docker-php-ext-install zip gmp bcmath \
    && apk del git

RUN mv $PHP_INI_DIR/php.ini-development $PHP_INI_DIR/php.ini

COPY ./common/php/conf.d /usr/local/etc/php/conf.d
COPY ./local/php/conf.d /usr/local/etc/php/conf.d

COPY ./common/wait-for-it.sh /usr/local/bin/wait-for-it
RUN chmod 555 /usr/local/bin/wait-for-it

ENV COMPOSER_ALLOW_SUPERUSER 1

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/bin --filename=composer --quiet

WORKDIR /app
