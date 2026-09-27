#!/usr/bin/env bash
# db connection values
export POSTGRES_USER=zec
export POSTGRES_PASSWORD=changeme
export POSTGRES_DB=zecxtend

# url of the web frontened if not hosted on localhost
export CORS_ALLOWED_ORIGINS=

# needs to be 32 bytes
export JWT_SECRET_KEY=dev-only-insecure-jwt-secret-change-me-0123456789

# docs configuration
export DOCS_ENABLED=true
export DOCS_USERNAME=admin
export DOCS_PASSWORD=changeme
