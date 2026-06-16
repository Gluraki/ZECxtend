#!/bin/bash
set -eo pipefail

source env.sh

docker compose up --build -d "$@"

docker compose --profile migrate build migrator

docker compose --profile migrate run --rm migrator upgrade head