# Getting Started
## API Server
### Prerequisites
- Docker
### Setup Instructions
1. Clone the repository
2. Navigate to the [api-server](../api-server) directory
3. Set your env vars in the [env.sh](../api-server/scripts/env.sh) file
   - For production, replace the dev values (`JWT_SECRET_KEY`, `POSTGRES_PASSWORD`, `DOCS_PASSWORD`)
   - The API docs are not reachable with the prod script; still recommended to set `DOCS_ENABLED=false` for prod
4. Run the [dev-build](../api-server/scripts/dev-build.sh) script (also works per container)
   - For production use [prod-build](../api-server/scripts/prod-build.sh) instead. It skips
     `docker-compose.override.yml`, so pgweb is not started and the auth/competition services
     have no localhost ports and are only reachable through the gateway
5. Check out the API docs (if enabled, dev only)

### API Documentation
The API documentation is found per service at:
- Competition Service: http://localhost:8001/docs/login
- Auth Service: http://localhost:8002/docs/login
