#!/bin/bash
set -e

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

docker compose up --build -d