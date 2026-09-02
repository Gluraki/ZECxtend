# Getting Started
## API Server
### Prerequisites
- Docker
### Setup Instructions
1. Clone the repository
2. Navigate to the [api-server](../api-server) directory
3. Set your env vars in the [env.sh](../api-server/scripts/env.sh) file
4. Run the dev-build script (also works per container)
   - If the images are already built, run the dev-start script
5. Check out the API docs (if enabled)

### API Documentation
The API documentation is found per service at:
- Competition Service: http://localhost:8001/docs/login
- Auth Service: http://localhost:8002/docs/login
