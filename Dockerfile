FROM dunglas/frankenphp:1-php8.3

# Install Node.js and npm from node image
COPY --from=node:22-bookworm-slim /usr/local/include/node /usr/local/include/node
COPY --from=node:22-bookworm-slim /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY --from=node:22-bookworm-slim /usr/local/bin/node /usr/local/bin/node
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

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
