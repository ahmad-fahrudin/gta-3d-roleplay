#!/bin/sh
set -e

# Setup .env if missing
if [ ! -f /app/.env ]; then
    if [ -f /app/.env.example ]; then
        cp /app/.env.example /app/.env
    fi
fi

# Ensure composer dependencies are installed
if [ ! -d /app/vendor ] || [ ! -f /app/vendor/autoload.php ]; then
    echo "Installing Composer dependencies..."
    composer install --no-interaction --prefer-dist
fi

# Ensure storage and bootstrap cache directories exist with correct permissions
mkdir -p /app/storage/framework/cache/data \
         /app/storage/framework/sessions \
         /app/storage/framework/views \
         /app/storage/logs \
         /app/bootstrap/cache

chmod -R 777 /app/storage /app/bootstrap/cache

# Generate application key if empty
if [ -f /app/.env ] && ! grep -q "^APP_KEY=base64:" /app/.env; then
    php artisan key:generate --force || true
fi

# Run database migrations
if [ "$DB_CONNECTION" = "mysql" ]; then
    echo "Running database migrations..."
    php artisan migrate --force || true
fi

exec "$@"
