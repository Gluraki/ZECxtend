# ZECxtend

Fork/Extension of [Niklas-Maderbacher/zec-timing](https://github.com/Niklas-Maderbacher/zec-timing).

## What This Is

ZECxtend aims to fulfill and extend what was originally planned for ZEC-timing while also serving as a playground for testing and learning.

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

Service API docs:

- Attempt Service: [docs/api/attempt_service.md](docs/api/attempt_service.md)
- Auth Service: [docs/api/auth_service.md](docs/api/auth_service.md)
- Challenge Service: [docs/api/challenge_service.md](docs/api/challenge_service.md)
- Score Service: [docs/api/score_service.md](docs/api/score_service.md)
- Team Service: [docs/api/team_service.md](docs/api/team_service.md)
- User Service: [docs/api/user_service.md](docs/api/user_service.md)
