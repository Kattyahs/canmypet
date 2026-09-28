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

1. Copy `.env.consumer.example` to `.env` and fill in:

   | Variable | Value |
   |---|---|
   | `CANMYPET_VERSION` | The image tag you were given (for example `sha-b54bc7f`) |
   | `POSTGRES_PASSWORD` | Any password for your local database |
   | `JWT_SECRET` | A random string: `openssl rand -hex 32` |
   | `ADMIN_EMAIL`, `ADMIN_PASSWORD` | The admin account created on first start (password: at least 8 characters) |
   | `PUBLIC_API_KEYS` | Your API key: `openssl rand -hex 32` |

   Leave the other values as they are. On Windows PowerShell, you can generate a
   random value with `[guid]::NewGuid().ToString("N") + [guid]::NewGuid().ToString("N")`.
2. Start the stack:
   ```bash
   docker compose -f docker-compose.consumer.yml up -d
   ```
3. Wait about 30 seconds and check:
   ```bash
   curl -i -H "X-API-Key: YOUR_KEY" "http://localhost:8080/api/public/v1/foods/safety?query=uva&species=DOG"
   ```
   A `200` with `Uvas` and `"riskLevel":"TOXIC"` means everything works.

Only port `8080` (the gateway) is published. The database and internal services
are not reachable from your machine.

| Result | Meaning |
|---|---|
| `200` with results | Everything works |
| `401 INVALID_API_KEY` | The header does not match `PUBLIC_API_KEYS` in your `.env` |
| `Couldn't connect to server` | Containers are still starting. If it persists, check `docker compose -f docker-compose.consumer.yml logs api-gateway` |
| `200` with `"results": []` | No food matches that name. Try another one, such as `choco` |

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
includes a **2. Setup** folder to add a food, register and approve a
veterinarian account, and verify the evaluation. You only need it to add foods
that are not in the preloaded catalog.

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

**Upgrading to a new version:** change `CANMYPET_VERSION` in `.env`, then run
`down -v` followed by `up -d`, so the database is recreated with the new data.

## 6. Versioning

The `v1` in the path is the contract version. New fields may be added to
responses without notice; your client should ignore unknown fields. Removing or
renaming fields will only happen in a new version (`v2`).
