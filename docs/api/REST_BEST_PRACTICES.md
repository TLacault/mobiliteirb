# Bonnes Pratiques REST - Guide de Référence

## 🎯 Principes REST Fondamentaux

### 1. Utilisation des Méthodes HTTP

| Méthode | Usage | Idempotent* | Sécurisé** |
|---------|-------|-------------|------------|
| GET | Lire/Récupérer des données | ✅ | ✅ |
| POST | Créer une nouvelle ressource | ❌ | ❌ |
| PUT | Remplacer complètement une ressource | ✅ | ❌ |
| PATCH | Modifier partiellement une ressource | ❌ | ❌ |
| DELETE | Supprimer une ressource | ✅ | ❌ |

*Idempotent = Appeler plusieurs fois a le même effet qu'une seule fois
**Sécurisé = Ne modifie pas l'état du serveur

### 2. Naming des Endpoints

#### ✅ À FAIRE
```
GET    /api/v1/mobilites           # Liste des mobilités
GET    /api/v1/mobilites/123       # Une mobilité spécifique
POST   /api/v1/mobilites           # Créer une mobilité
PUT    /api/v1/mobilites/123       # Remplacer une mobilité
PATCH  /api/v1/mobilites/123       # Modifier une mobilité
DELETE /api/v1/mobilites/123       # Supprimer une mobilité
```

#### ❌ À ÉVITER
```
GET /get_mobilites                 # Préfixe de verbe inutile (GET indique déjà l'action)
POST /creer_mobilite              # Idem
DELETE /supprimer_mobilite?id=123 # ID devrait être dans l'URL, pas en query
GET /mobilite                     # Singulier pour une collection
POST /mobilites/new               # Suffixe inutile
```

### 3. Versionning de l'API

#### ✅ Recommandé : Dans l'URL
```
https://api.example.com/v1/mobilites
https://api.example.com/v2/mobilites
```

**Avantages** :
- Facile à comprendre et à utiliser
- Visible dans l'URL
- Simple à router côté serveur

### 4. Codes de Statut HTTP

| Code | Signification | Quand l'utiliser |
|------|---------------|------------------|
| 200 | OK | Requête réussie (GET, PUT, PATCH, DELETE) |
| 201 | Created | Ressource créée avec succès (POST) |
| 204 | No Content | Succès sans contenu à retourner |
| 400 | Bad Request | Données invalides ou manquantes |
| 401 | Unauthorized | Authentification requise |
| 403 | Forbidden | Authentifié mais non autorisé |
| 404 | Not Found | Ressource inexistante |
| 409 | Conflict | Conflit (ex: email déjà utilisé) |
| 422 | Unprocessable Entity | Validation échouée |
| 500 | Internal Server Error | Erreur serveur |

### 5. Structure des Réponses

#### Succès (200/201)
```json
{
  "id": "abc-123",
  "name": "Mobilité Stockholm",
  "startLocation": "Bordeaux",
  "endLocation": "Stockholm",
  "created_at": "2026-02-17T10:00:00Z"
}
```

#### Erreur (400/404/500)
```json
{
  "error": "Description claire de l'erreur",
  "code": "VALIDATION_ERROR",
  "details": {
    "field": "email",
    "message": "Format d'email invalide"
  }
}
```

### 6. Query Parameters vs Path Parameters

#### Path Parameters (Identifier une ressource)
```
GET /api/v1/mobilites/:id           # ID dans l'URL
GET /api/v1/users/:userId/mobilites # Ressources imbriquées
```

#### Query Parameters (Filtrer, trier, paginer)
```
GET /api/v1/mobilites?year=2026&is_anonymous=false  # Filtres
GET /api/v1/mobilites?sort=name&order=asc         # Tri
GET /api/v1/mobilites?page=2&limit=20             # Pagination
GET /api/v1/mobilites?search=stockholm            # Recherche
```

### 7. Relations entre Ressources

#### ✅ Ressources imbriquées (recommandé pour les dépendances fortes)
```
GET    /api/v1/mobilites/123/trajets           # Tous les trajets d'une mobilité
POST   /api/v1/mobilites/123/trajets           # Créer un trajet dans une mobilité
GET    /api/v1/trajets/456/etapes              # Toutes les étapes d'un trajet
```

#### ✅ Ressources indépendantes (pour les relations faibles)
```
GET    /api/v1/trajets?mobilite_id=123        # Alternative avec query param
DELETE /api/v1/trajets/456                    # Opération sur le trajet directement
```

### 8. Conventions de Naming

#### URLs
- **Minuscules uniquement**
- **Pluriel pour les collections** : `/mobilites`, `/trajets`
- **Traits d'union pour séparer** : `/transport-modes` (pas underscore)
- **Pas de trailing slash** : `/mobilites` (pas `/mobilites/`)

#### Champs JSON
- **camelCase** en JavaScript : `startLocation`, `isAnonymous`
- **snake_case** en base de données : `start_location`, `is_anonymous`
- **Adapter avec Prisma** : utiliser `@map()` dans le schema

### 9. Pagination

```javascript
// Requête
GET /api/v1/mobilites?page=2&limit=20

// Réponse
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 157,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": true
  }
}
```

### 10. Sécurité

#### Headers recommandés
```javascript
// CORS
Access-Control-Allow-Origin: https://mobilit.eirb.fr

// Rate Limiting
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1645098000

// Authentification
Authorization: Bearer <token>
```

#### Validation des données
- ✅ Toujours valider côté serveur
- ✅ Utiliser des bibliothèques (ex: Joi, Yup, Zod)
- ✅ Nettoyer les inputs (protection XSS)
- ✅ Limiter la taille des payloads

### 11. Documentation

#### Outils recommandés
- **Swagger/OpenAPI** : Documentation interactive
- **Postman Collections** : Collections partagées
- **README.md** : Documentation simple et accessible

## 📚 Ressources Complémentaires

- [REST API Tutorial](https://restfulapi.net/)
- [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines)
- [HTTP Status Codes](https://httpstatuses.com/)
- [JSON API Specification](https://jsonapi.org/)

## ✅ Checklist Avant de Déployer

- [ ] Versionning de l'API implémenté
- [ ] Codes de statut HTTP appropriés
- [ ] Validation des données entrantes
- [ ] Gestion des erreurs cohérente
- [ ] Authentification/Autorisation en place
- [ ] Rate limiting configuré
- [ ] CORS configuré correctement
- [ ] Documentation à jour
- [ ] Tests automatisés écrits
- [ ] Logging implémenté
