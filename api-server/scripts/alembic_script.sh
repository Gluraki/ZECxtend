#!/bin/bash
set -eo pipefail

if [ -z "$1" ]; then
    echo "Usage: ./alembic_script.sh <message>"
    exit 1
fi

cd "$(dirname "$0")/.."
source scripts/env.sh

docker compose --profile migrate run --rm migrator \
    revision --autogenerate -m "$1"

docker compose --profile migrate run --rm migrator \
    upgrade head