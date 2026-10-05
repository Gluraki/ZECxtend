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
