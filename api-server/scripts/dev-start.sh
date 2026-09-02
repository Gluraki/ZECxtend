#!/usr/bin/env bash
set -eo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"
source env.sh
cd ..

docker compose up -d "$@"
