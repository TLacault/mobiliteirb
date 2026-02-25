# API Calls & Components - Quick Start Guide

## 🚀 Démarrage Rapide

### Configuration
L'API backend est configurée dans `nuxt.config.ts` :
```typescript
apiBase: "http://localhost:3001/api/v1"
```

---

## 📁 Deux Approches Disponibles

### ✅ Approche 1 : Composables (Recommandé Nuxt 3)

**Fichiers créés** :
- `composables/useMobilities.js` - Composable (auto-importé)
- `components/MobilitiesList.vue` - Composant
- `pages/mobilites.vue` - Page de test

**Usage** :
```vue
<script setup>
const { getAllMobilities } = useMobilities(); // Auto-importé !
const { data, pending, error } = await getAllMobilities();
</script>
```

**Pour tester** : Visitez `http://localhost:8080/mobilites`

---

### ✅ Approche 2 : Services (Alternative classique)

**Fichiers créés** :
- `services/mobilityService.js` - Service Layer
- `components/MobilitiesListService.vue` - Composant

**Usage** :
```vue
<script setup>
import { mobilityAPI } from '~/services/mobilityService';
const mobilities = ref([]);
mobilities.value = await mobilityAPI.getAll();
</script>
```

---

## 🎯 Quelle Approche Choisir ?

| Critère | Composables | Services |
|---------|------------|----------|
| Auto-import | ✅ Oui | ❌ Non |
| SSR automatique | ✅ Oui | ⚠️ Manuel |
| Convention Nuxt | ✅ Oui | ⚠️ Classique |
| Facilité tests | ⚠️ Context requis | ✅ Simple |
| Familiarité | Nuxt 3 | Standard JS |

**Les deux sont valides !** Choisissez selon votre préférence.

---

## 📊 API Functions Disponibles

### Avec Composables
```javascript
const {
  getAllMobilities,    // GET /mobilites
  getMobilityById,     // GET /mobilites/:id
  createMobility,      // POST /mobilites
  deleteMobility,      // DELETE /mobilites/:id
} = useMobilities();
```

### Avec Services
```javascript
import { mobilityAPI, tripAPI, stepAPI } from '~/services/mobilityService';

// Mobilités
await mobilityAPI.getAll()
await mobilityAPI.getById(id)
await mobilityAPI.create(data)
await mobilityAPI.delete(id)

// Trajets
await tripAPI.getByMobility(mobilityId)

// Étapes
await stepAPI.getByTrip(tripId)
```

---

## 🧪 Tester les Composants

### Option 1 : Page dédiée
Visitez : `http://localhost:8080/mobilites`

### Option 2 : Dans app.vue
```vue
<template>
  <div>
    <Navbar />
    <MobilitiesList />  <!-- Ajoutez ceci -->
    <NuxtPage />
  </div>
</template>
```

---

## 🔧 Fonctionnalités Implémentées

- ✅ Liste toutes les mobilités
- ✅ Gestion loading/error
- ✅ Suppression avec confirmation
- ✅ Navigation vers détails
- ✅ Design responsive (grid)
- ✅ Affichage infos user & trajets

---

## 🆘 Troubleshooting

### CORS Error
```javascript
// backend/index.js
const cors = require('cors');
app.use(cors({ origin: 'http://localhost:8080' }));
```

### SSR Error avec Services
Utilisez `onMounted` :
```vue
<script setup>
onMounted(async () => {
  data.value = await mobilityAPI.getAll();
});
</script>
```

---

## 📚 Documentation Complète

- **Guide complet** : `docs/API_CALLS_GUIDE.md`
- **Backend API** : `../backend/README.md`
- **Testing** : `../backend/TESTING.md`

---

## 🎨 Prochaines Étapes

1. ✅ Tester `/mobilites`
2. 🔐 Ajouter authentification JWT
3. ➕ Créer formulaire de création
4. 📄 Créer page de détails `[id].vue`
5. 🎨 Améliorer le CSS avec votre design system
