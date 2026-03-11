## API Documentation

### Base URL

```
http://localhost:3001/api/v1
Production: https://mobilit.eirb.fr/api/v1
```

### REST Standards

- Endpoints follow REST conventions with English resource names
- HTTP methods express the action: `GET` = read, `POST` = create, `PATCH` = partial update, `DELETE` = remove
- Create/update payloads go in the JSON body
- Resource IDs are path parameters

All endpoints require a Bearer token: `Authorization: Bearer <access_token>`

---

### Endpoints — Mobilities

#### `GET /mobilities`

Returns the list of mobilities for the authenticated user.

**Response:**

```json
[
  { "uuid": "123e4567-e89b-12d3-a456-426614174000" },
  { "uuid": "123e4567-e89b-12d3-a456-426614174001" }
]
```

---

#### `POST /mobilities`

Creates a new mobility.

**Request body:**

```json
{
  "name": "Erasmus 2024",
  "year": "2024-01-01",
  "startLocation": "Paris, France",
  "endLocation": "Berlin, Germany",
  "isPublic": true,
  "isOriginal": true
}
```

**Response `201`:**

```json
{ "uuid": "123e4567-e89b-12d3-a456-426614174000" }
```

---

#### `GET /mobilities/{id}`

Returns detailed information about a specific mobility, including aggregated stats.

**Path parameter:** `id` — Mobility UUID

**Response:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Erasmus 2024",
  "year": "2024-01-01T00:00:00.000Z",
  "isPublic": true,
  "isOriginal": true,
  "lastEdit": "2024-06-01T12:00:00.000Z",
  "startLocation": "Paris, France",
  "endLocation": "Berlin, Germany",
  "stats": {
    "totalCarbon": 150.5,
    "totalDistance": 1200.0,
    "stepCount": 4
  },
  "trips": []
}
```

---

#### `PATCH /mobilities/{id}`

Partially updates a mobility.

**Path parameter:** `id` — Mobility UUID

**Request body** (all fields optional):

```json
{
  "name": "Erasmus Germany 2024",
  "year": "2024-09-01",
  "isPublic": false,
  "startLocation": "Bordeaux, France",
  "endLocation": "Munich, Germany"
}
```

**Response:**

```json
{ "message": "Mobility updated", "id": "123e4567-e89b-12d3-a456-426614174000" }
```

---

#### `DELETE /mobilities/{id}`

Deletes a mobility.

**Path parameter:** `id` — Mobility UUID

**Response:**

```json
{ "message": "Mobility deleted successfully", "id": "123e4567-e89b-12d3-a456-426614174000" }
```

---

### Endpoints — Trips

#### `GET /mobilities/{id}/trips`

Returns the list of trips belonging to a mobility.

**Path parameter:** `id` — Mobility UUID

**Response:**

```json
[
  { "uuid": "223e4567-e89b-12d3-a456-426614174000" },
  { "uuid": "223e4567-e89b-12d3-a456-426614174001" }
]
```

---

#### `GET /trips/{tripId}`

Returns the details and stats of a specific trip.

**Path parameter:** `tripId` — Trip UUID

**Response:**

```json
{
  "name": "Paris → Berlin",
  "isSelected": true,
  "emissions": 150.5,
  "distance": 1200.0,
  "steps": 4
}
```

---

#### `PATCH /trips/{tripId}`

Partially updates a trip.

**Path parameter:** `tripId` — Trip UUID

**Request body** (all fields optional):

```json
{
  "name": "Outbound flight",
  "isSelected": false
}
```

**Response:**

```json
{ "message": "Trip updated", "trip": { ... } }
```

---

#### `DELETE /trips/{tripId}`

Deletes a trip.

**Path parameter:** `tripId` — Trip UUID

**Response:**

```json
{ "message": "Trip deleted" }
```
