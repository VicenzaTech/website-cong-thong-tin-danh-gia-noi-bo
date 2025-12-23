#!/bin/sh
set -e

echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h postgres -U postgres 2>/dev/null; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "PostgreSQL is ready!"

echo "Running database migrations..."
npx prisma migrate deploy || echo "Migration failed or already applied"

echo "Checking if database needs seeding..."
SEEDED_FILE=/app/.seed_complete
if [ ! -f "$SEEDED_FILE" ]; then
  echo "Seeding database..."
  npm run db:seed || echo "Seed failed or already seeded"
  touch "$SEEDED_FILE"
else
  echo "Database already seeded, skipping..."
fi

echo "Starting application..."
exec "$@"

