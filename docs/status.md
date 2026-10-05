# API-Server
## Numbers
- 6 services -> 2 Total now
- 6 DBs -> 1 Total now
- 1,3 GB Dockerfile per Service -> 1,5 GB Total now
## Explanation
- shared functions mean less boilerplate code
- Setup easier with different dev and prod scripts
  - no more change this in KEYCLOAK or half the services crash
- FKs are now handled by the DB, not the API
- Swagger docs behind a login are now reachable
- Seed data now runs on it own not via the services
- Score table has been dropped and leaderboard is now calculated
- Tests are now unified and not split into 6 different folders
- Migrations now use Alembic and not *create_all*

# Website
- WIP

# Timekeeper-App
- NOT WORKING
- Attempts can be input via the API this would use however
- API-Key is also implemented for this
