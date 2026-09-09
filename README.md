# CanMyPet

Web platform to check food safety risk levels for pets by species and life stage, manage
multiple pet profiles, keep search history, and access emergency guidance.
Includes a veterinarian role for verifying food safety entries and answering FAQs.

## Tech stack

- **Backend:** Java 19 + Spring Boot 3.3.4 + Spring Security (JWT) + Maven
- **Architecture:** Microservices (4 independent Spring Boot services + API Gateway)
- **Inter-service communication:** REST via OpenFeign
- **Frontend:** React + Vite + Tailwind CSS
- **Database:** PostgreSQL 16 (database-per-service)
- **Containerization:** Docker & Docker Compose
- **API Documentation:** Swagger / OpenAPI (per service) + Postman collection
- **Testing:** JUnit 5, Mockito, AssertJ, Testcontainers
- **CI:** GitHub Actions

## Architecture

```mermaid
graph TD
    Frontend["Frontend (React + Vite + Tailwind)"]
    Gateway["API Gateway :8080"]
    UserSvc["user-service :8091"]
    PetSvc["pet-service :8082"]
    FoodSvc["food-service :8083"]
    UserDB[("canmypet_users")]
    PetDB[("canmypet_pets")]
    FoodDB[("canmypet_foods")]

    Frontend -->|HTTP| Gateway
    Gateway --> UserSvc
    Gateway --> PetSvc
    Gateway --> FoodSvc

    PetSvc -.->|OpenFeign| UserSvc
    FoodSvc -.->|OpenFeign| UserSvc

    UserSvc --> UserDB
    PetSvc --> PetDB
    FoodSvc --> FoodDB
```

- The frontend only ever talks to the **API Gateway**, which routes each request to the right service based on the URL path.
- Services that need data from another service call it directly via **OpenFeign** (dashed lines above), never through the gateway and never by touching another service's database.
- Each service owns its own PostgreSQL database — no cross-service SQL joins, no service discovery tool (small, fixed number of services; Docker Compose's internal DNS is enough).

## Getting started

1. Copy `.env.example` to `.env` and fill in real values (database credentials, JWT secret, etc.).
2. Run `docker compose up --build`.
3. Wait for all 5 containers (`postgres`, `user-service`, `pet-service`, `food-service`, `api-gateway`) to report healthy/running: `docker compose ps`.
4. API Gateway (single entry point for all requests): `http://localhost:8080`
5. Frontend (when available): `http://localhost:5173`

### API documentation

- **Postman collection:** available at `docs/postman/` — the complete, ready-to-import reference for every endpoint, including an auto-saving JWT token script.
- **Swagger UI** (interactive, live from each running service):
    - user-service: `http://localhost:8091/swagger-ui/index.html`
    - pet-service: `http://localhost:8082/swagger-ui/index.html`
    - food-service: `http://localhost:8083/swagger-ui/index.html`

## Endpoints

### Auth & Users (user-service)

| Method | Path | Auth required | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register a new user (OWNER, VETERINARIAN, or ADMIN) |
| POST | `/api/auth/login` | No | Log in, returns a JWT |
| GET | `/api/users/me` | Yes | Get the current user's profile |
| PUT | `/api/users/me` | Yes | Update the current user's profile |
| PUT | `/api/users/{id}/verify` | ADMIN | Approve a veterinarian account |
| GET | `/api/users/{id}` | Yes | Internal use — get a user by id |

### Pets & Search History (pet-service)

| Method | Path | Auth required | Description |
|---|---|---|---|
| GET | `/api/pets` | Yes | List the current user's pets |
| POST | `/api/pets` | Yes | Create a pet |
| PUT | `/api/pets/{id}` | Yes (owner) | Update a pet |
| DELETE | `/api/pets/{id}` | Yes (owner) | Delete a pet |
| GET | `/api/search-history/me` | Yes | Get the current user's search history |
| POST | `/api/search-history` | Yes | Record a search |

### Foods & Food Safety (food-service)

| Method | Path | Auth required | Description |
|---|---|---|---|
| GET | `/api/foods` | Yes | List all foods |
| GET | `/api/foods/{id}` | Yes | Get a food by id |
| GET | `/api/foods/search?query=` | Yes | Search foods by name |
| POST | `/api/foods` | ADMIN | Create a food |
| GET | `/api/food-safety/{foodId}/{species}` | Yes | Get risk levels for a food/species, optionally filtered by `?lifeStage=` |
| POST | `/api/food-safety` | VETERINARIAN, ADMIN | Create a food safety entry |
| PUT | `/api/food-safety/{id}/verify` | VETERINARIAN, ADMIN | Verify a food safety entry |

### FAQ & Emergency Guidance (food-service)

| Method | Path | Auth required | Description |
|---|---|---|---|
| GET | `/api/faq` | Yes | List all FAQ questions |
| POST | `/api/faq` | Yes | Ask a question |
| PUT | `/api/faq/{id}/answer` | VETERINARIAN | Answer a question |
| GET | `/api/emergency/{riskLevel}` | Yes | Get emergency guidance for a risk level |
| POST | `/api/emergency` | ADMIN | Create or update an emergency guide |

## Testing

- **Unit tests:** JUnit 5 + Mockito, covering the core business logic of each service.
- **Integration tests:** Testcontainers spins up a real PostgreSQL 16 container to test the full registration/login flow end-to-end.
- Run locally per service: `mvn test` (inside each `backend/<service>` folder).
- Runs automatically on every push via GitHub Actions (`.github/workflows/backend-ci.yml`).

## Contributing / Commit conventions

This project follows [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:

```
<type>: <short description>
```

Common types used in this project:
- `feat:` — a new feature
- `fix:` — a bug fix
- `docs:` — documentation-only changes
- `test:` — adding or updating tests
- `refactor:` — code reorganization without changing behavior
- `ci:` — changes to CI/CD configuration
- `chore:` — maintenance tasks (dependencies, config)

Each backend service follows [Semantic Versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`) in its `pom.xml`.