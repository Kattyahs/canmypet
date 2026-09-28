# CanMyPet Public API — Consumer Guide

Read-only API to check whether a pet can eat a food, by species and life stage.
It is meant to be called **server to server**: your backend calls it, never your
users' browsers.

---

## 1. Run CanMyPet locally

You do not need the source code. CanMyPet is distributed as Docker images on
GitHub Container Registry.

### Files you need

```
canmypet-consumer/
├── docker-compose.consumer.yml
├── .env.consumer.example
└── docker/
    └── init-db.sql
```

### Steps

1. If the images are private, log in to GHCR with a GitHub personal access token
   (classic) that has the `read:packages` scope:
   ```bash
   docker login ghcr.io -u YOUR_GITHUB_USER
   ```
2. Copy `.env.consumer.example` to `.env` and fill in:

   | Variable | Value |
   |---|---|
   | `CANMYPET_VERSION` | The image tag you were given (for example `sha-73f9777`) |
   | `POSTGRES_PASSWORD` | Any password for your local database |
   | `JWT_SECRET` | A random string: `openssl rand -base64 32` |
   | `ADMIN_EMAIL`, `ADMIN_PASSWORD` | The admin account created on first start |
   | `PUBLIC_API_KEYS` | Your API key: `openssl rand -hex 32` |

   Leave the other values as they are.
3. Start the stack:
   ```bash
   docker compose -f docker-compose.consumer.yml up -d
   ```
4. Wait about 30 seconds and check:
   ```bash
   curl -i -H "X-API-Key: YOUR_KEY" "http://localhost:8080/api/public/v1/foods/safety?query=choco&species=DOG"
   ```
   A `200` with `"results": []` means everything works but the database is empty
   (see section 3).

Only port `8080` (the gateway) is published. The database and internal services
are not reachable from your machine.

---

## 2. The endpoint

```
GET /api/public/v1/foods/safety?query={text}&species={species}&lifeStage={lifeStage}
X-API-Key: {your key}
```

| Parameter | Required | Values |
|---|---|---|
| `query` | Yes | 2 to 100 characters. Partial, case-insensitive match on the food name (`choco` finds `Chocolate`). Accents and typos are not handled yet |
| `species` | Yes | `DOG`, `CAT`, `RABBIT`, `BIRD`, `HAMSTER`, `GUINEA_PIG`, `FERRET`, `TURTLE`, `OTHER` |
| `lifeStage` | No | `PUPPY`, `ADULT`, `SENIOR` |

### 200 OK

```json
{
  "species": "DOG",
  "lifeStage": "PUPPY",
  "results": [
    {
      "foodId": 1,
      "foodName": "Chocolate",
      "category": "human food",
      "evaluation": {
        "lifeStage": null,
        "riskLevel": "TOXIC",
        "notes": "Contiene teobromina. Puede causar vómitos, arritmias y convulsiones.",
        "sources": [
          { "name": "ASPCA Animal Poison Control", "url": "https://www.aspca.org/pet-care/animal-poison-control" }
        ]
      }
    }
  ]
}
```

- Up to 10 results, sorted by name. No matches: `"results": []` (not an error).
- `riskLevel`: `SAFE`, `MODERATE`, `TOXIC` or `LETHAL`.
- **`evaluation: null` means "no information for this species". It never means
  the food is safe.** Show something like "No information available; consult a
  veterinarian".
- `evaluation.lifeStage: null` means the evaluation applies to all life stages.
  When you send `lifeStage` and there is no stage-specific evaluation, the
  general one is returned.
- Only evaluations verified by a veterinarian are returned.
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

## 3. Loading data into a fresh instance

A new instance starts with an empty catalog. For the API to return an
evaluation, three things must exist: a food, an evaluation for a species, and a
veterinarian who verified that evaluation.

The Postman collection `docs/postman/canmypet-public-api.postman_collection.json`
does it for you:

1. Import the collection into Postman.
2. In the collection variables, set `apiKey`, `adminEmail` and `adminPassword`
   (the same values as in your `.env`).
3. Run the requests in folder **2. Setup** in order (01 to 07). They save the
   tokens and IDs automatically.
4. Run **1. Public API → Search foods with safety (dog)**: Chocolate should come
   back with `riskLevel: TOXIC`.

---

## 4. Calling it from your backend

- Read the base URL and the key from environment variables, for example
  `CANMYPET_API_URL=http://localhost:8080` and `CANMYPET_API_KEY=...`. When
  CanMyPet is deployed, only those two values change.
- Never send the key to the browser, and never commit it.
- Treat `evaluation: null` and any error response as "no information", never as
  "safe".
- Add a short timeout (2–3 seconds) and show a fallback message if CanMyPet does
  not answer.

## 5. Versioning

The `v1` in the path is the contract version. New fields may be added to
responses without notice; your client should ignore unknown fields. Removing or
renaming fields will only happen in a new version (`v2`).
