# État Actuel du Projet

> Document de référence pour comprendre l'architecture et l'approche technique actuelles

## 📋 Vue d'ensemble

**MOBILIT'EIRB** est une application de calcul d'empreinte carbone pour les mobilités étudiantes.

### Stack Technique

| Couche | Technologie | Version | Port |
|--------|-------------|---------|------|
| **Frontend** | Nuxt 3 + Vue 3 | 3.32+ | 8080 |
| **Backend** | Node.js + Express | 22 / 4.21 | 3001 |
| **Database** | PostgreSQL + PostGIS | 15 | 5433 |
| **ORM** | Prisma | 5.x | - |

### Environnement

- **Docker Compose** pour tous les services
- **Makefile** pour les commandes courantes
- **Hot-reload** activé en développement

## 🏗️ Architecture

### Structure Générale

```
mobilit-eirb/
├── frontend/          # Application Nuxt 3 (Client-Side Only)
├── backend/           # API Express + Prisma
├── docs/              # Documentation
└── docker-compose.yml # Configuration Docker
```

### Backend (Express + Prisma)

```
backend/
├── index.js                  # Point d'entrée avec CORS et routes
├── prisma/
│   ├── schema.prisma        # Schéma de base de données
│   ├── seed.js              # Seeding aléatoire
│   └── migrations/          # Historique des migrations
├── controllers/
│   └── mobilityController.js # Logique CRUD pour Mobilité
├── routes/
│   └── mobilityRoutes.js     # Routes /api/v1/mobilites
└── middlewares/              # (vide pour l'instant)
```

#### Endpoints Implémentés

✅ **Mobilités**
- `GET /api/v1/mobilites` - Liste toutes les mobilités avec user et trips
- `GET /api/v1/mobilites/:id` - Récupère une mobilité par ID
- `POST /api/v1/mobilites` - Crée une nouvelle mobilité
- `DELETE /api/v1/mobilites/:id` - Supprime une mobilité

⚠️ **À implémenter**
- Endpoints Trajet (Trip)
- Endpoints Étape (Step)
- Authentification JWT

#### CORS

CORS activé pour `http://localhost:8080` (frontend en dev) :

```javascript
app.use(cors({
  origin: "http://localhost:8080",
  credentials: true
}));
```

### Frontend (Nuxt 3)

```
frontend/
├── app.vue                   # Composant racine
├── nuxt.config.ts           # Config minimale (DevTools activés)
├── API_GUIDE.md             # 📚 Documentation des appels API
├── pages/
│   ├── index.vue            # Page d'accueil
│   └── mobilites.vue        # Page liste des mobilités
└── components/
    └── MobilitiesList.vue   # Composant avec appels API client-side
```

#### Approche Client-Side Only

⚠️ **Important** : Ce projet **n'utilise PAS le SSR** de Nuxt.

**Pourquoi ?**
- Les conteneurs Docker ne partagent pas localhost
- Le SSR tenterait d'appeler `localhost:3001` depuis le conteneur Nuxt
- Solution plus simple : appels API uniquement côté client

**Comment ?**
```vue
<script setup>
const API_BASE = 'http://localhost:3001/api/v1';
const data = ref([]);

onMounted(async () => {
  data.value = await $fetch(`${API_BASE}/mobilites`);
});
</script>
```

**Bonnes pratiques** :
- ✅ URL API en dur dans les composants
- ✅ Appels dans `onMounted()`
- ✅ Wrapper `<ClientOnly>` dans les pages
- ❌ Pas de `useFetch` (nécessite SSR)
- ❌ Pas de `useRuntimeConfig()` (problèmes Docker)

### Base de Données (PostgreSQL + PostGIS)

#### Modèles Prisma

```prisma
model User {
  id         String     @id @default(uuid())
  casLogin   String     @unique
  email      String     @unique
  mobilities Mobility[]
}

model Mobility {
  id            String   @id @default(uuid())
  name          String
  year          DateTime
  startLocation String?
  endLocation   String?
  isPublic      Boolean  @default(false)
  trips         Trip[]
  user          User     @relation(fields: [userId], references: [id])
  userId        String
}

model Trip {
  id          String   @id @default(uuid())
  name        String
  travelMode  String
  isSelected  Boolean  @default(false)
  steps       Step[]
  mobility    Mobility @relation(fields: [mobilityId], references: [id])
  mobilityId  String
}

model Step {
  id          String                     @id @default(uuid())
  name        String
  location    Unsupported("geography")?  // PostGIS
  trip        Trip                       @relation(fields: [tripId], references: [id])
  tripId      String
}
```

#### Seeding

Commandes disponibles :

```bash
make seed         # Efface et remplit avec données aléatoires
make seed-append  # Ajoute sans effacer
make db-reset     # Reset complet + migrations + seed
```

Documentation : [backend/SEEDING.md](../backend/SEEDING.md)

## 🚀 Commandes Utiles

### Développement

```bash
# Démarrer tous les services
docker compose up -d

# Voir les logs
docker compose logs -f

# Redémarrer un service
docker compose restart backend
docker compose restart frontend

# Arrêter tous les services
docker compose down
```

### Base de données

```bash
# Générer le client Prisma
cd backend && npx prisma generate

# Créer une migration
cd backend && npx prisma migrate dev --name ma_migration

# Voir l'état des migrations
cd backend && npx prisma migrate status

# Studio Prisma (GUI)
cd backend && npx prisma studio
```

### Tests API

```bash
# Liste des mobilités
curl http://localhost:3001/api/v1/mobilites

# Mobilité par ID
curl http://localhost:3001/api/v1/mobilites/UUID_ICI

# Créer une mobilité
curl -X POST http://localhost:3001/api/v1/mobilites \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mon Erasmus",
    "start": "Bordeaux",
    "end": "Stockholm",
    "is_public": true,
    "year": "2026-06-01",
    "userId": "UUID_USER"
  }'
```

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [API.md](./API.md) | Standards REST et conventions |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Architecture détaillée du projet |
| [DB_RELATIONNEL.md](./DB_RELATIONNEL.md) | Modèle relationnel de la DB |
| [GIT_WORKFLOW.md](./GIT_WORKFLOW.md) | Convention Git et branches |
| [frontend/API_GUIDE.md](../frontend/API_GUIDE.md) | **Guide appels API (IMPORTANT)** |
| [backend/SEEDING.md](../backend/SEEDING.md) | Guide complet du seeding |

## 🔄 Workflow de Développement

### 1. Récupérer les dernières modifications

```bash
git pull origin main
docker compose up -d --build
```

### 2. Créer une nouvelle fonctionnalité

```bash
git checkout -b feature/nom-de-la-feature
# Développer...
git add .
git commit -m "feat: description"
git push origin feature/nom-de-la-feature
# Créer une Pull Request
```

### 3. Tester localement

```bash
# Backend
curl http://localhost:3001/api/v1/mobilites

# Frontend
# Ouvrir http://localhost:8080 dans le navigateur
```

## ⚠️ Points d'Attention

### Authentification Temporaire

❌ **Actuellement** : userId passé manuellement dans les requêtes
✅ **À faire** : Implémenter JWT avec middleware d'authentification

### Limitations Docker/SSR

- SSR non supporté en Docker (problème localhost inter-conteneurs)
- Solution actuelle : Client-Side Only avec `$fetch` et `onMounted()`
- Acceptable pour un projet étudiant, mais limiterait le SEO en production

### CORS en Production

⚠️ CORS actuellement configuré pour `http://localhost:8080`
- À changer pour l'URL de production
- Utiliser variables d'environnement : `process.env.FRONTEND_URL`

## 🎯 Prochaines Étapes

### Priorité Haute

1. **Implémenter endpoints Trajet (Trip)**
   - GET /mobilites/:id/trajets
   - PUT /trajets/:id/select
   - DELETE /trajets/:id

2. **Implémenter endpoints Étape (Step)**
   - GET /trajets/:id/etapes
   - POST /trajets/:id/etapes
   - DELETE /etapes/:id

3. **Authentification JWT**
   - Middleware backend/middlewares/auth.js
   - Extraction userId depuis token
   - Login/Logout endpoints

### Priorité Moyenne

4. **Formulaires Frontend**
   - MobilityForm.vue
   - TripForm.vue
   - StepForm.vue

5. **Pages détails**
   - pages/mobilites/[id].vue

6. **Calcul empreinte carbone**
   - Service de calcul CO2
   - Affichage dans l'interface

### Priorité Basse

7. **Tests automatisés**
8. **Documentation API (Swagger)**
9. **Optimisations performances**

## 🐛 Troubleshooting

### ❌ Erreur CORS
**Symptôme** : `CORS error` dans la console navigateur

**Solution** :
1. Vérifier que backend/index.js a `app.use(cors({origin: "http://localhost:8080"}))`
2. Redémarrer le backend : `docker compose restart backend`

### ❌ Erreur 404 sur API
**Symptôme** : `[GET] http://localhost:3001/api/v1/mobilites: 404`

**Solution** :
1. Vérifier que le backend est lancé : `docker compose ps`
2. Tester avec curl : `curl http://localhost:3001/api/v1/mobilites`
3. Vérifier les logs : `docker compose logs backend`

### ❌ Les données ne s'affichent pas
**Symptôme** : Composant vide, pas d'erreur

**Solution** :
1. Ouvrir F12 → Console pour voir les erreurs
2. Vérifier l'onglet Network pour voir les requêtes
3. S'assurer que `onMounted()` est utilisé dans le composant
4. Vérifier que `<ClientOnly>` entoure le composant dans la page

### ❌ Prisma Client non généré
**Symptôme** : `@prisma/client` introuvable

**Solution** :
```bash
cd backend
npx prisma generate
docker compose restart backend
```

## 📞 Contact

Pour toute question sur l'architecture ou l'implémentation, consultez d'abord :
1. Cette documentation
2. [frontend/API_GUIDE.md](../frontend/API_GUIDE.md)
3. Les fichiers de code existants (MobilitiesList.vue, mobilityController.js)

Équipe : voir [README.md](../README.md) pour les contacts
