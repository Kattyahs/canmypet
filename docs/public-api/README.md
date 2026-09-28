# CanMyPet Public API — Consumer Guide

Read-only API to check whether a pet can eat a food, by species and life stage.
It is meant to be called **server to server**: your backend calls it, never your
users' browsers.

---

## 1. Run CanMyPet locally

You do not need the source code or a GitHub account. CanMyPet is distributed as
public Docker images on GitHub Container Registry, and the database comes
preloaded with verified food evaluations.

### Files you need

```
canmypet-consumer/
├── docker-compose.consumer.yml
├── .env.consumer.example
└── docker/
    └── init-db.sql
```

### Steps

1. Copy `.env.consumer.example` to `.env` and set your API key:

```
   PUBLIC_API_KEYS=your_random_key
```

Generate it with `openssl rand -hex 32`, or on Windows PowerShell with
`[guid]::NewGuid().ToString("N") + [guid]::NewGuid().ToString("N")`.

That is the only required value. Everything else has a local default in
`docker-compose.consumer.yml` (see [Defaults](#defaults)). If
`PUBLIC_API_KEYS` is missing, `docker compose` stops with
`Set PUBLIC_API_KEYS in .env`.
2. Start the stack:
```bash
   docker compose -f docker-compose.consumer.yml up -d
```
3. Wait about 30 seconds and check:
```bash
   curl -i -H "X-API-Key: YOUR_KEY" "http://localhost:8080/api/public/v1/foods/safety?query=uva&species=DOG"
```
A `200` with `Uvas` and `"riskLevel":"TOXIC"` means everything works.

Only port `8080` (the gateway) is published, and only on `127.0.0.1`: other
machines on your network cannot reach it. The database and internal services
are not reachable from your machine.

| Result | Meaning |
|---|---|
| `200` with results | Everything works |
| `401 INVALID_API_KEY` | The header does not match `PUBLIC_API_KEYS` in your `.env` |
| `Couldn't connect to server` | Containers are still starting. If it persists, check `docker compose -f docker-compose.consumer.yml logs api-gateway` |
| `200` with `"results": []` | No food matches that name. Try another one, such as `choco` |

### Defaults

These values are used when they are not set in `.env`. They are meant for a
local copy only; to change one, uncomment it in `.env`.

| Variable | Default |
|---|---|
| `CANMYPET_VERSION` | `sha-b54bc7f` |
| `GATEWAY_PORT` | `8080` |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` | `canmypet_user` / `canmypet_local` |
| `JWT_SECRET` | A fixed local-only value |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | `admin@canmypet.local` / `admin-local-123` |
| `SPRING_PROFILES_ACTIVE` | `dev` (loads the demo data) |

If port `8080` is taken, set `GATEWAY_PORT` to another value and use that port
in your requests.

### Alternative: run from the repository

Use this if you want to read the code, try the full application (including
the frontend) or run a version that has not been published as images yet.
It builds the services from source inside Docker, so you do not need Java or
Maven installed.

1. Clone the repository. To match the published images exactly, check out the
   same commit instead of the latest `main`:
```bash
   git clone https://github.com/Kattyahs/canmypet.git
   cd canmypet
   git checkout b54bc7f
```
2. Copy `.env.example` to `.env` and set `POSTGRES_PASSWORD`, `JWT_SECRET`,
   `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `PUBLIC_API_KEYS`. Optionally set
   `DEMO_PASSWORD` to log in as the demo veterinarian (`vet@demo.canmypet`).
   Keep `SPRING_PROFILES_ACTIVE=dev`, which loads the demo data.
3. This setup publishes more ports: `8080` (gateway), `8091`, `8082`, `8083`
   and `POSTGRES_PORT` (default `5432`). If you already run PostgreSQL locally,
   change `POSTGRES_PORT` (for example to `5433`).
4. Build and start the five containers (the first build takes 5–10 minutes):
```bash
   docker compose up -d --build
   docker compose ps
```
5. Optional frontend: `cd frontend && npm install && npm run dev`, then open
   `http://localhost:5173`.
6. To upgrade: `git pull`, then `docker compose down -v` and
   `docker compose up -d --build`.

In this setup food-service is also published directly on port `8083`, where
the API key is not checked. That is acceptable for local use, but your backend
should always call the gateway on port `8080`.

---

## 2. The endpoint

```
GET /api/public/v1/foods/safety?query={text}&species={species}&lifeStage={lifeStage}
X-API-Key: {your key}
```

| Parameter | Required | Values |
|---|---|---|
| `query` | Yes | 2 to 100 characters. Partial, case-insensitive match on the food name (`choco` finds `Chocolate`). Accents and typos are not handled yet (`platano` does not find `Plátano`) |
| `species` | Yes | `DOG`, `CAT`, `RABBIT`, `BIRD`, `HAMSTER`, `GUINEA_PIG`, `FERRET`, `TURTLE`, `OTHER` |
| `lifeStage` | No | `PUPPY`, `ADULT`, `SENIOR` |

### 200 OK

```json
{
  "species": "DOG",
  "lifeStage": null,
  "results": [
    {
      "foodId": 4,
      "foodName": "Uvas",
      "category": "fruit",
      "evaluation": {
        "lifeStage": null,
        "riskLevel": "TOXIC",
        "notes": "Pueden causar insuficiencia renal aguda. La sensibilidad varía entre perros y no se conoce una cantidad segura. Si lo comió, contacta de inmediato a un veterinario.",
        "sources": [
          { "name": "ASPCA Animal Poison Control", "url": "https://www.aspca.org/pet-care/aspca-poison-control/people-foods-avoid-feeding-your-pets" }
        ]
      }
    }
  ]
}
```

- Up to 10 results, sorted by name. No matches: `"results": []` (not an error).
  When several foods match (for example, `nuez` matches `Nueces` and
  `Nueces de macadamia`), show them all and let the user pick.
- `riskLevel`: `SAFE`, `MODERATE`, `TOXIC` or `LETHAL`.
- **`evaluation: null` means "no information for this species". It never means
  the food is safe.** Show something like "No information available; consult a
  veterinarian".
- `evaluation.lifeStage: null` means the evaluation applies to all life stages.
  When you send `lifeStage` and there is no stage-specific evaluation, the
  general one is returned.
- Only evaluations verified by a veterinarian account are returned.
- `notes` are in Spanish. `sources[].url` can be `null`.

### Errors (`application/problem+json`)

```json
{
  "type": "https://canmypet.dev/problems/invalid-parameter",
  "title": "Invalid parameter",
  "status": 400,
  "detail": "Invalid value 'PERRO' for parameter 'species'. Allowed values: [DOG, CAT, RABBIT, BIRD, HAMSTER, GUINEA_PIG, FERRET, TURTLE, OTHER]",
  "code": "INVALID_PARAMETER"
}
```

| Status | `code` | When |
|---|---|---|
| 400 | `INVALID_PARAMETER` | Missing `query` or `species`, invalid enum value, or `query` outside 2–100 characters |
| 401 | `INVALID_API_KEY` | Missing or invalid `X-API-Key` |
| 500 | `INTERNAL_ERROR` | Unexpected error |

Use the `code` field in your logic, not `detail`: `detail` is a human-readable
message and may change.

---

## 3. About the data

- The instance starts with 63 foods and their evaluations for dogs and cats
  (plus birds and rabbits for avocado), all with cited sources: ASPCA Animal
  Poison Control, Pet Poison Helpline, American Kennel Club and PetMD.
- The information is qualitative (no doses) and is meant as a reference. It
  does not replace a veterinary consultation: show the sources and a notice to
  consult a veterinarian in your UI.
- A species is only evaluated when there is a source for it. For example,
  xylitol is evaluated for dogs only, so a query for cats returns
  `evaluation: null`.

### Adding more foods (optional)

The Postman collection `docs/postman/canmypet-public-api.postman_collection.json`
includes a **2. Optional - add your own food** folder to add a food, register
and approve a veterinarian account, and verify the evaluation. You only need it
to add foods that are not in the preloaded catalog.

---

## 4. Calling it from your backend

- Read the base URL and the key from environment variables, for example
  `CANMYPET_API_URL=http://localhost:8080` and `CANMYPET_API_KEY=...`. If your
  backend runs inside Docker, use `http://host.docker.internal:8080`. When
  CanMyPet is deployed, only those two values change.
- Never send the key to the browser, and never commit it.
- Treat `evaluation: null` and any error response as "no information", never as
  "safe".
- Add a short timeout (2–3 seconds) and show a fallback message if CanMyPet does
  not answer.

## 5. Day-to-day commands

| Action | Command |
|---|---|
| Stop (keeps the data) | `docker compose -f docker-compose.consumer.yml down` |
| Start again | `docker compose -f docker-compose.consumer.yml up -d` |
| Follow the logs | `docker compose -f docker-compose.consumer.yml logs -f` |
| Delete everything and start over | `docker compose -f docker-compose.consumer.yml down -v` |

**Upgrading to a new version:** set `CANMYPET_VERSION` in `.env` to the new
tag (or replace `docker-compose.consumer.yml` with the new one), then run
`down -v` followed by `up -d`, so the database is recreated with the new data.

## 6. Versioning

The `v1` in the path is the contract version. New fields may be added to
responses without notice; your client should ignore unknown fields. Removing or
renaming fields will only happen in a new version (`v2`).