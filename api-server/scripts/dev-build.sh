#!/bin/bash
set -eo pipefail

# App database
export POSTGRES_USER=zec
export POSTGRES_PASSWORD=changeme
export POSTGRES_DB=zecxtend

# Authentik database
export PG_DB=authentik
export PG_USER=authentik
export PG_PASS=changeme

# Authentik config
export AUTHENTIK_SECRET_KEY=changeme-generate-a-real-one
export AUTHENTIK_BOOTSTRAP_EMAIL=admin@localhost
export AUTHENTIK_BOOTSTRAP_PASSWORD=changeme
export AUTHENTIK_BOOTSTRAP_TOKEN=changeme-bootstrap-token

docker compose up --build -d "$@"

echo "Waiting for postgres..."
until docker exec db pg_isready -U "$POSTGRES_USER" > /dev/null 2>&1; do
    sleep 1
done
echo "Postgres ready"

docker compose --profile migrate build migrator

docker compose --profile migrate run --rm migrator upgrade head