# Getting Started
## API Server
### Setup Instructions
1. Clone the repository
2. Navigate to the [api-server](../api-server) directory
3. Set your env vars in the [env.sh](../api-server/scripts/env.sh) file (for production see [below](#production-env-values))
  - The API docs are not reachable with the prod script; still recommended to set `DOCS_ENABLED=false` for prod
4. Run one of the two build scripts both need docker and compose
  - For development use [dev-build](../api-server/scripts/dev-build.sh)
  - For production use [prod-build](../api-server/scripts/prod-build.sh). It skips
     `docker-compose.override.yml`, so pgweb is not started and the auth/competition services
     have no localhost ports and are only reachable through the gateway
5. Check out the API docs (if enabled, dev-script only)
6. Do not worry the migrate service will stop on its own after the migration & seed data is done

### Seed data
The challenges and penalty types are in [api-server/seed](../api-server/seed)
(`challenges.json`, `penalty_types.json`).

### API Documentation
The API documentation is found per service at:
- Competition Service: http://localhost:8001/docs/login
- Auth Service: http://localhost:8002/docs/login
Log in with `DOCS_USERNAME` / `DOCS_PASSWORD`.

## Local Development
Needs uv. Run uv sync --all-packages from [api-server](../api-server).
  - after just activate the venv for your session
To run tests just run pytest from [api-server](../api-server) or a specific test folder

## Website
### Setup Instructions
1. Requires the [API Server](#api-server) first
2. Navigate to the [website](../website) directory
3. Copy `.env.example` to `.env` and set `VITE_API_URL` to the gateway url (default `http://localhost`)
  - If the website is not served from `http://localhost:3000`, add its url to `CORS_ALLOWED_ORIGINS` in [env.sh](../api-server/scripts/env.sh)
4. Run `docker compose up -d --build`; the website is reachable at http://localhost:3000
  - `VITE_API_URL` is baked in at build time, rebuild after changing it

### Local Development
Needs pnpm. Run `pnpm install` and `pnpm run dev` from [website](../website)

## ZECtime
### Installing
The builds are not signed, so Windows SmartScreen will warn on first start.

### Usage
1. Requires the [API Server](#api-server) and an MQTT broker the ESPs publish to
2. On start enter the API url (gateway, default `http://localhost`), the `API_KEY` from
   [env.sh](../api-server/scripts/env.sh) and the broker host/port/topic
  - The values are saved locally and prefilled on the next start
3. ESP messages must look like `{"esp_id": "<prefix>-<mac>", "timestamp": "<ISO datetime>"}`
  - The mac is matched against the challenge's ESP macs (`:` or `-` separated both work)
4. Press Activate to start collecting timestamps, pick start/end timestamps (the median of
   the selected ones is used) and submit the attempt
5. The Pairing card updates the ESP macs of the selected challenge in the API
