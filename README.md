# ZECxtend

Fork/Extension of [Niklas-Maderbacher/zec-timing](https://github.com/Niklas-Maderbacher/zec-timing).

## The Goal

ZECxtend is an extension of the Zec-timing focused on improving the architecture and fixing limitations of the original implementation while adding some new funtionality.

# Status

Current focus: 
- slimming down api-server
- redoing core features

Detailed progress check out: [docs/status.md](docs/status.md)

# Contents 

ZECxtend consists of two Next.js frontends and one microservice FastAPI backend:

- [website/](website/) - competition management and leaderboard view
- [timekeeper-app/](timekeeper-app/) - attempt input interface
- [api-server/](api-server/) - business logic for all components
- [docs/](docs/) - architecture and project documentation

## Features
- Manage teams, drivers, and users in one system
- Configure challenges and attempt rules for competitions
- Capture and store attempts with timing and validity data
- Calculate scores, apply penalties, and build leaderboards
- Run locally as a full containerized stack with Docker Compose

## Starter Guide

Start here:

- Getting started: [docs/guides/getting-started.md](docs/guides/getting-started.md)

## Documentation

Architecture:

- System design: [docs/architecture/system-design.md](docs/architecture/system-design.md)
- Database schema: [docs/architecture/database-schema.md](docs/architecture/database-schema.md)
