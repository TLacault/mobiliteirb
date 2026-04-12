# API Calls - Guide Frontend

## 🎯 Approche : Client-Side Only

**Important** : Ce projet utilise une approche **client-side uniquement** pour les appels API. Le SSR (Server-Side Rendering) n'est **pas utilisé** en raison de la configuration Docker (les conteneurs ne peuvent pas communiquer via localhost pendant le SSR).

## 📋 Structure

```
frontend/
├── components/
│   └── MobilitiesList.vue     # Composant qui appelle l'API
├── pages/
│   └── mobilites.vue          # Page utilisant ClientOnly
└── nuxt.config.ts             # Configuration (apiBase non utilisée)
```

## 🔧 Configuration API

L'URL de l'API est **en dur** dans les composants :

```javascript
const API_BASE = 'http://localhost:3001/api/v1';
```

**Pourquoi ?**
- En développement Docker, `useRuntimeConfig()` ne fonctionne pas correctement avec SSR
- L'approche client-side simple est plus fiable et prévisible

## 📝 Comment faire des appels API

### Exemple de base

```vue
<template>
  <div>
    <div v-if="loading">Chargement...</div>
    <div v-else-if="error">Erreur : {{ error }}</div>
    <div v-else>
      <div v-for="item in items" :key="item.id">
        {{ item.name }}
      </div>
    </div>
  </div>
</template>

<script setup>
const API_BASE = 'http://localhost:3001/api/v1';

const items = ref([]);
const loading = ref(false);
const error = ref(null);

const fetchData = async () => {
  loading.value = true;
  error.value = null;

  try {
    items.value = await $fetch(`${API_BASE}/mobilites`);
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

// Charger uniquement côté client
onMounted(() => {
  fetchData();
});
</script>
```

### GET Request

```javascript
// Récupérer toutes les mobilités
const mobilities = await $fetch(`${API_BASE}/mobilites`);

// Récupérer une mobilité par ID
const mobility = await $fetch(`${API_BASE}/mobilites/${id}`);
```

### POST Request

```javascript
const newMobility = await $fetch(`${API_BASE}/mobilites`, {
  method: 'POST',
  body: {
    name: 'Ma mobilité',
    start: 'Bordeaux',
    end: 'Paris',
    is_anonymous: false,
    year: '2026-06-01',
    userId: 'user-id-here'
  }
});
```

### DELETE Request

```javascript
await $fetch(`${API_BASE}/mobilites/${id}`, {
  method: 'DELETE'
});
```

## 🚫 Ce qu'il NE FAUT PAS faire

### ❌ N'utilisez PAS useFetch avec SSR

```vue
<!-- NE PAS FAIRE -->
<script setup>
const { data } = await useFetch('/api/mobilites'); // ❌ Erreur 404
</script>
```

### ❌ N'utilisez PAS useRuntimeConfig pour l'API

```vue
<!-- NE PAS FAIRE -->
<script setup>
const config = useRuntimeConfig();
const apiBase = config.public.apiBase; // ❌ Ne fonctionne pas en Docker
</script>
```

## ✅ Bonnes pratiques

### 1. Toujours utiliser ClientOnly

Enveloppez vos composants qui font des appels API dans `<ClientOnly>` :

```vue
<template>
  <ClientOnly>
    <MobilitiesList />
    <template #fallback>
      <div>Chargement...</div>
    </template>
  </ClientOnly>
</template>
```

### 2. Charger dans onMounted

Utilisez toujours `onMounted` pour les appels API :

```vue
<script setup>
onMounted(async () => {
  await fetchData();
});
</script>
```

### 3. Gestion des erreurs

Toujours gérer les erreurs proprement :

```javascript
try {
  const data = await $fetch(`${API_BASE}/endpoint`);
  // Traiter les données
} catch (err) {
  console.error('Erreur API:', err);
  error.value = err.message;
}
```

## 🔄 Endpoints disponibles

### Mobilités

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/mobilites` | Liste toutes les mobilités |
| GET | `/mobilites/:id` | Récupère une mobilité |
| POST | `/mobilites` | Crée une mobilité |
| DELETE | `/mobilites/:id` | Supprime une mobilité |

### Trajets

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/mobilites/:id/trajets` | Liste les trajets d'une mobilité |
| PUT | `/trajets/:id/select` | Toggle la sélection d'un trajet |
| DELETE | `/trajets/:id` | Supprime un trajet |

### Étapes

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/trajets/:id/etapes` | Liste les étapes d'un trajet |
| POST | `/trajets/:id/etapes` | Crée une étape |
| DELETE | `/etapes/:id` | Supprime une étape |

## 🐛 Troubleshooting

### Erreur CORS

Si vous voyez `CORS error` dans la console :

1. Vérifiez que le backend a CORS activé ([backend/index.js](../backend/index.js))
2. Redémarrez le conteneur backend : `docker compose restart backend`

### Erreur 404

Si vous voyez `404 Page not found` :

1. Vérifiez que l'URL de l'API est correcte : `http://localhost:3001/api/v1`
2. Testez l'API directement : `curl http://localhost:3001/api/v1/mobilites`
3. Vérifiez que le backend est lancé : `docker compose ps`

### Les données ne se chargent pas

1. Ouvrez la console du navigateur (F12)
2. Vérifiez les erreurs dans l'onglet Console
3. Vérifiez les requêtes dans l'onglet Network
4. Assurez-vous que `onMounted` est bien utilisé

## 📚 Ressources

- [Backend API Documentation](../backend/README.md)
- [REST API Standards](../docs/REST_BEST_PRACTICES.md)
- [Backend Testing Guide](../backend/TESTING.md)

## 💡 Pourquoi pas SSR ?

Le SSR nécessiterait une configuration réseau Docker complexe :
- Les conteneurs ne partagent pas localhost
- Il faudrait un réseau interne ou un proxy
- L'approche client-side est plus simple et fonctionne parfaitement pour ce projet

Pour un projet de production avec SSR, vous devriez :
1. Configurer un réseau Docker interne
2. Utiliser des noms de services Docker au lieu de localhost
3. Configurer des variables d'environnement différentes pour SSR et client
