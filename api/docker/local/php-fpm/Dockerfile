FROM php:8.1-fpm-alpine3.15

ENV XDEBUG_VERSION 3.1.3

RUN apk add --no-cache pcre-dev $PHPIZE_DEPS postgresql-dev fcgi git imagemagick imagemagick-dev \
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
COPY ./common/php/php-fpm.d /usr/local/etc/php-fpm.d
COPY ./local/php/conf.d /usr/local/etc/php/conf.d
COPY ./local/php-fpm/conf.d /usr/local/etc/php/conf.d

WORKDIR /app

COPY ./local/php-fpm/entrypoint.sh /usr/local/bin/docker-php-entrypoint
RUN chmod +x /usr/local/bin/docker-php-entrypoint

HEALTHCHECK --interval=5s --timeout=3s --start-period=1s \
    CMD REDIRECT_STATUS=true SCRIPT_NAME=/ping SCRIPT_FILENAME=/ping REQUEST_METHOD=GET \
    cgi-fcgi -bind -connect 127.0.0.1:9000 || exit 1
