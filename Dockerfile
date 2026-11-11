FROM dunglas/frankenphp:1-php8.3

# Install system dependencies and PHP extensions
RUN install-php-extensions \
    pdo_mysql \
    bcmath \
    pcntl \
    intl \
    zip \
    opcache \
    redis \
    gd

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Custom PHP settings for local development & hot reload
COPY docker/php/conf.d/app.ini /usr/local/etc/php/conf.d/app.ini

# Custom Caddyfile for FrankenPHP worker mode with watcher
COPY docker/caddy/Caddyfile /etc/caddy/Caddyfile

WORKDIR /app

# Entrypoint script
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

CMD ["frankenphp", "run", "--config", "/etc/caddy/Caddyfile"]
