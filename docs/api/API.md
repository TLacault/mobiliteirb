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
**Fonction** : Récupérer la liste des uuid des mobilités de l'utilisateur connecté

**Réponse** :
```json
[
  {
    "uuid": ["123e4567-e89b-12d3-a456-426614174000", "123e4567-e89b-12d3-a456-426614174001", "123e4567-e89b-12d3-a456-426614174002", ...]
  }
]
```


#### `GET /mobilites/:id`
**Fonction** : Récupère des informations détaillées sur une mobilité spécifique par son ID

**Exemple** : `GET /mobilites/123e4567-e89b-12d3-a456-426614174000`

**Paramètres URL** :
- `id` (obligatoire) : UUID de la mobilité à récupérer

**Réponse** :
```json
[
  {
    "name": "Mobilité Erasmus 2024",
    "startLocation": "Paris, France",
    "endLocation": "Berlin, Germany",
    "lastEdit": "2024",
    "emissions": 150.5,
    "time": 120,
    "steps": 10000,
  }
]
```

<!-- TODO DELETE /mobilites/:id - supprimer une mobilité par son ID -->

<!-- TODO POST /mobilites - créer une nouvelle mobilité -->

<!-- TODO PUT /mobilites/:id - modifier la visibilité d'une mobilité (publique/privée) -->
