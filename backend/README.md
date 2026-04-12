# Backend API - Structure et Documentation

## 🏗️ Structure du Projet

```
backend/
├── controllers/         # Logique métier des endpoints
│   └── mobilityController.js
├── routes/             # Définition des routes
│   └── mobilityRoutes.js
├── middlewares/        # Middlewares (authentification, validation, etc.)
├── prisma/             # Schema et migrations de la base de données
│   ├── schema.prisma
│   └── migrations/
├── index.js            # Point d'entrée de l'application
└── package.json
```

## 📋 Standards REST Implémentés

### Principes suivis :
- ✅ **Versionning de l'API** : `/api/v1/...`
- ✅ **Méthodes HTTP appropriées** : GET (lire), POST (créer), PUT (modifier), DELETE (supprimer)
- ✅ **Noms de ressources au pluriel** : `/mobilites`, `/trajets`, `/etapes`
- ✅ **Path parameters pour les IDs** : `/mobilites/:id`
- ✅ **Body JSON pour la création/modification** : Pas de données sensibles dans l'URL
- ✅ **Codes de statut HTTP standards** : 200, 201, 400, 404, 500
- ✅ **Réponses JSON structurées** : Messages d'erreur clairs

## 🚀 Endpoints Mobilités (Implémentés)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/v1/mobilites` | Récupère toutes les mobilités |
| GET | `/api/v1/mobilites/:id` | Récupère une mobilité par ID |
| POST | `/api/v1/mobilites` | Crée une nouvelle mobilité |
| DELETE | `/api/v1/mobilites/:id` | Supprime une mobilité |

### Exemples d'utilisation

#### Créer une mobilité
```bash
curl -X POST http://localhost:3001/api/v1/mobilites \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vacances d'\''été",
    "start": "Bordeaux",
    "end": "Paris",
    "is_anonymous": false,
    "year": "2026-06-01",
    "userId": "votre-user-id"
  }'
```

#### Récupérer toutes les mobilités
```bash
curl http://localhost:3001/api/v1/mobilites
```

#### Récupérer une mobilité par ID
```bash
curl http://localhost:3001/api/v1/mobilites/abc-123-def
```

#### Supprimer une mobilité
```bash
curl -X DELETE http://localhost:3001/api/v1/mobilites/abc-123-def
```

## 📝 Modèle de Données (Prisma)

Le modèle Mobility dans le schéma Prisma :

```prisma
model Mobility {
    id         String   @id @default(uuid())
    name       String
    year       DateTime @db.Date
    isAnonymous Boolean  @default(false)
    lastEdit   DateTime @updatedAt

    startLocation String
    endLocation   String

    userId String
    user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

    trips Trip[]
}
```

## 🔧 Comment ajouter de nouveaux endpoints

### 1. Créer un controller
Créez un fichier dans `controllers/` (ex: `trajetController.js`) :

```javascript
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getAllTrajets = async (req, res) => {
  // ... logique
};

module.exports = { getAllTrajets };
```

### 2. Créer les routes
Créez un fichier dans `routes/` (ex: `trajetRoutes.js`) :

```javascript
const express = require("express");
const router = express.Router();
const trajetController = require("../controllers/trajetController");

router.get("/", trajetController.getAllTrajets);

module.exports = router;
```

### 3. Enregistrer les routes dans index.js
```javascript
const trajetRoutes = require("./routes/trajetRoutes");
app.use("/api/v1/trajets", trajetRoutes);
```

## 🔐 TODO : À implémenter

- [ ] **Authentification JWT** : Extraction du userId depuis le token
- [ ] **Middlewares de validation** : Validation des données entrantes
- [ ] **Middleware d'authentification** : Vérifier que l'utilisateur est connecté
- [ ] **Tests unitaires** : Tests des controllers et routes
- [ ] **Gestion des erreurs centralisée** : Middleware d'erreur global
- [ ] **Logging** : Winston ou Pino pour les logs
- [ ] **Rate limiting** : Protection contre les abus
- [ ] **CORS** : Configuration pour le frontend

## 📚 Prochaines étapes

1. **Implémenter les endpoints Trajets** (voir `docs/API.md`)
2. **Implémenter les endpoints Étapes** (voir `docs/API.md`)
3. **Ajouter l'authentification JWT/CAS**
4. **Mettre en place les tests automatisés**
