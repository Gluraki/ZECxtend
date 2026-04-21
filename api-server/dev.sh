#!/bin/bash
export POSTGRES_USER=zec
export POSTGRES_PASSWORD=changeme
export POSTGRES_DB=zecxtend
export PG_PASS=changeme
export AUTHENTIK_SECRET_KEY=changeme-generate-a-real-one

docker compose up --build -d