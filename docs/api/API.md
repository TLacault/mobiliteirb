## API Documentation

### Base URL
```
http://localhost:3001/api/v1
Production: https://mobilit.eirb.fr/api/v1
```

### Standards REST
- Les endpoints suivent les conventions REST
- Les méthodes HTTP indiquent l'action (GET=lire, POST=créer, PUT=modifier, DELETE=supprimer)
- Les données de création/modification sont dans le body JSON
- Les IDs de ressources uniques sont dans l'URL (path parameters)

---

### Endpoints - Mobilités

#### `GET /mobilites`
**Fonction** : Récupère toutes les mobilités de l'utilisateur connecté

**Réponse** :
```json
[
  {
    "id": 1,
    "name": "Vacances d'été",
    "start": "Bordeaux",
    "end": "Paris",
    "is_public": true,
    "created_at": "2026-02-17T10:00:00Z"
  }
]
```

---

#### `GET /mobilites/:id`
**Fonction** : Récupère une mobilité spécifique par son ID

**Exemple** : `GET /mobilites/123`

**Paramètres URL** :
- `id` (obligatoire) : ID de la mobilité à récupérer

**Réponse** :
```json
{
  "id": 123,
  "name": "Vacances d'été",
  "start": "Bordeaux",
  "end": "Paris",
  "is_public": true,
  "created_at": "2026-02-17T10:00:00Z"
}
```

---

#### `POST /mobilites`
**Fonction** : Crée une nouvelle mobilité

**Exemple** : `POST /mobilites`

**Body** :
```json
{
  "name": "Vacances d'été",
  "start": "Bordeaux",
  "end": "Paris",
  "is_public": true,
  "year": "2026-06-01",
  "userId": "user-uuid-here"
}
```

**Paramètres body** :
- `name` (obligatoire, string) : Nom de la mobilité
- `start` (obligatoire, string) : Lieu de départ (sera converti en `startLocation`)
- `end` (obligatoire, string) : Lieu d'arrivée (sera converti en `endLocation`)
- `is_public` (optionnel, boolean) : Indique si la mobilité est publique - par défaut **true**
- `year` (optionnel, date) : Année de la mobilité (format ISO 8601) - par défaut l'année actuelle
- `userId` (obligatoire, string) : UUID de l'utilisateur (temporaire - sera extrait du JWT plus tard)

**Réponse** :
```json
{
  "id": 124,
  "name": "Vacances d'été",
  "start": "Bordeaux",
  "end": "Paris",
  "is_public": true,
  "created_at": "2026-02-17T10:30:00Z"
}
```

---

#### `DELETE /mobilites/:id`
**Fonction** : Supprime une mobilité par son ID

**Exemple** : `DELETE /mobilites/123`

**Paramètres URL** :
- `id` (obligatoire) : ID de la mobilité à supprimer

**Réponse** :
```json
{
  "message": "Mobilité supprimée avec succès",
  "id": 123
}
```


---

### Endpoints - Trajets

#### `GET /mobilites/:mobilite_id/trajets`
**Fonction** : Récupère tous les trajets d'une mobilité spécifique

**Exemple** : `GET /mobilites/123/trajets`

**Paramètres URL** :
- `mobilite_id` (obligatoire) : ID de la mobilité dont on veut récupérer les trajets

**Réponse** :
```json
[
  {
    "id": 456,
    "mobilite_id": 123,
    "selected": true,
    "created_at": "2026-02-17T10:00:00Z"
  }
]
```

---

#### `PUT /trajets/:id/select`
**Fonction** : Toggle la sélection d'un trajet pour la synthèse

**Exemple** : `PUT /trajets/456/select`

**Paramètres URL** :
- `id` (obligatoire) : ID du trajet à toggle

**Réponse** :
```json
{
  "id": 456,
  "selected": false
}
```

---

#### `DELETE /trajets/:id`
**Fonction** : Supprime un trajet par son ID

**Exemple** : `DELETE /trajets/456`

**Paramètres URL** :
- `id` (obligatoire) : ID du trajet à supprimer

**Réponse** :
```json
{
  "message": "Trajet supprimé avec succès",
  "id": 456
}
```


---

### Endpoints - Étapes

#### `GET /trajets/:trajet_id/etapes`
**Fonction** : Récupère toutes les étapes d'un trajet spécifique

**Exemple** : `GET /trajets/456/etapes`

**Paramètres URL** :
- `trajet_id` (obligatoire) : ID du trajet dont on veut récupérer les étapes

**Réponse** :
```json
[
  {
    "id": 789,
    "trajet_id": 456,
    "start": "Bordeaux",
    "end": "Paris",
    "transport": "train",
    "created_at": "2026-02-17T10:00:00Z"
  }
]
```

---

#### `POST /trajets/:trajet_id/etapes`
**Fonction** : Crée une nouvelle étape dans un trajet

**Exemple** : `POST /trajets/456/etapes`

**Paramètres URL** :
- `trajet_id` (obligatoire) : ID du trajet auquel ajouter l'étape

**Body** :
```json
{
  "start": "Bordeaux",
  "end": "Paris",
  "transport": "train"
}
```

**Paramètres body** :
- `start` (obligatoire, string) : Lieu de départ de l'étape
- `end` (obligatoire, string) : Lieu d'arrivée de l'étape
- `transport` (obligatoire, string) : Moyen de transport utilisé (ex: "train", "avion", "voiture", "bus", "vélo", "marche")

**Réponse** :
```json
{
  "id": 790,
  "trajet_id": 456,
  "start": "Bordeaux",
  "end": "Paris",
  "transport": "train",
  "created_at": "2026-02-17T11:00:00Z"
}
```

---

#### `DELETE /etapes/:id`
**Fonction** : Supprime une étape par son ID

**Exemple** : `DELETE /etapes/789`

**Paramètres URL** :
- `id` (obligatoire) : ID de l'étape à supprimer

**Réponse** :
```json
{
  "message": "Étape supprimée avec succès",
  "id": 789
}
```
