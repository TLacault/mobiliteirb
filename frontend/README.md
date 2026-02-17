# Frontend MobilitEirb - Nuxt 3

## 🎯 Stack Frontend

Le frontend utilise **Nuxt 3** en mode **Client-Side Only** :
- ✅ **Vue 3 Composition API** moderne et réactive
- ✅ **Vue Router intégré** avec routing automatique basé sur les fichiers
- ✅ **DevTools Nuxt** pour un debugging avancé
- ✅ **Auto-imports** des composants
- ✅ **Docker-ready** avec configuration simple

**⚠️ SSR désactivé** : Ce projet utilise uniquement le rendu côté client (CSR) en raison de la configuration Docker où les conteneurs ne peuvent pas communiquer via localhost pendant le SSR.

## 📁 Structure du projet

```
frontend/
├── app.vue                 # Composant racine de l'application
├── nuxt.config.ts          # Configuration Nuxt
├── API_GUIDE.md           # 📚 Guide pour faire des appels API (IMPORTANT)
├── pages/                  # Pages de l'application (routing automatique)
│   ├── index.vue          # Page d'accueil (/)
│   └── mobilites.vue      # Page des mobilités (/mobilites)
├── components/            # Composants réutilisables (auto-importés)
│   └── MobilitiesList.vue # Liste des mobilités avec appels API
├── public/                # Assets statiques
└── Dockerfile             # Configuration Docker
```

**Aucun SSR** : Les appels API se font uniquement côté client dans `onMounted()`.

## 🚀 Démarrage

### Développement avec Docker (recommandé)

```bash
# Depuis la racine du projet
docker compose up -d

# Le frontend sera accessible sur http://localhost:5137
# Le backend API sera sur http://localhost:3000
```

### Développement sans Docker

```bash
cd frontend
npm install
npm run dev
```

Le serveur de développement démarre sur **http://localhost:3000** (ou un port disponible).

## 🔧 Configuration

### Appels API

Les appels API utilisent une approche **client-only**. L'URL de l'API est définie directement dans les composants :

```javascript
const API_BASE = 'http://localhost:3000/api/v1';
```

**Voir [API_GUIDE.md](./API_GUIDE.md) pour la documentation complète des appels API.** 📚

### Nuxt Config

Le fichier `nuxt.config.ts` contient la configuration minimale :

```typescript
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true }
})
```

Pas de `runtimeConfig` utilisé pour éviter les problèmes SSR en Docker.

## 📝 Routing

Nuxt utilise le **routing basé sur les fichiers**. Créez simplement un fichier dans `/pages` :

```
pages/
├── index.vue              → /
├── about.vue             → /about
├── users/
│   ├── index.vue         → /users
│   └── [id].vue          → /users/:id
└── [...slug].vue         → catch-all route
```

### Exemple de navigation

```vue
<template>
  <div>
    <!-- Navigation avec NuxtLink -->
    <NuxtLink to="/">Accueil</NuxtLink>
    <NuxtLink to="/about">À propos</NuxtLink>

    <!-- Navigation programmatique -->
    <button @click="navigateTo('/users')">Voir les utilisateurs</button>
  </div>
</template>
```

## 🎨 Composants

Les composants dans `/components` sont **auto-importés** :

```vue
<!-- components/MyButton.vue -->
<template>
  <button class="my-button">
    <slot />
  </button>
</template>

<!-- pages/index.vue -->
<template>
  <div>
    <!-- Pas besoin d'import ! -->
    <MyButton>Cliquez-moi</MyButton>
  </div>
</template>
```

## 📡 Appels API

**⚠️ Important** : Lisez d'abord [API_GUIDE.md](./API_GUIDE.md) pour comprendre l'approche client-only.

### Exemple rapide

```vue
<template>
  <div>
    <div v-if="loading">Chargement...</div>
    <div v-else-if="error">Erreur : {{ error }}</div>
    <ul v-else>
      <li v-for="item in items" :key="item.id">{{ item.name }}</li>
    </ul>
  </div>
</template>

<script setup>
const API_BASE = 'http://localhost:3000/api/v1';
const items = ref([]);
const loading = ref(false);
const error = ref(null);

onMounted(async () => {
  loading.value = true;
  try {
    items.value = await $fetch(`${API_BASE}/mobilites`);
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});
</script>
```

### Points clés

- ✅ Utilisez `$fetch` pour les requêtes HTTP
- ✅ Appelez l'API dans `onMounted()` (client-side uniquement)
- ✅ Enveloppez les composants avec `<ClientOnly>` dans les pages
- ❌ N'utilisez PAS `useFetch` (nécessite SSR)
- ❌ N'utilisez PAS `useRuntimeConfig()` (problèmes Docker)

Voir [components/MobilitiesList.vue](./components/MobilitiesList.vue) comme exemple complet.

## 🛠️ Outils de développement

### Nuxt DevTools

Les DevTools Nuxt sont activés par défaut en dev. Accédez-y via :
- L'icône Nuxt en bas de votre navigateur
- Ou visitez `http://localhost:5137/__nuxt_devtools__/`

Fonctionnalités :
- 📊 Visualisation des pages et routes
- 🔍 Inspection des composants et de leur état
- ⚡ Timeline de performance

### Hot Module Replacement (HMR)

Le HMR est automatique - vos modifications sont reflétées instantanément.

## 🐳 Docker

Le Dockerfile utilise un **multi-stage build** :
- **Base** : Node 22 Alpine avec pnpm
- **Dev** : Lance `pnpm dev` avec hot-reload sur port 3000 (mappé vers 5137)
- **Production** : Build SPA et serveur avec Nginx

### Environnement de développement

```bash
docker compose up -d
```

Le frontend tourne sur http://localhost:5137 avec hot-reload activé.

## 📚 Ressources

- [API_GUIDE.md](./API_GUIDE.md) - **Guide principal pour les appels API**
- [Documentation Nuxt 3](https://nuxt.com)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Backend API Documentation](../docs/API.md)

## ⚡ Quick Tips

### Créer une nouvelle page

```bash
# Créez simplement un fichier dans /pages
touch pages/about.vue  # Accessible sur /about
```

### Créer un nouveau composant

```bash
# Créez un fichier dans /components
touch components/MyButton.vue  # Auto-importé partout
```

### Appeler l'API

```vue
<script setup>
const API_BASE = 'http://localhost:3000/api/v1';

onMounted(async () => {
  const data = await $fetch(`${API_BASE}/mobilites`);
});
</script>
```

## 🚨 Troubleshooting

### Erreur CORS
- Vérifiez que le backend autorise http://localhost:5137
- Redémarrez le backend : `docker compose restart backend`

### Erreur 404 sur appels API
- Vérifiez que l'URL de l'API est `http://localhost:3000/api/v1`
- Testez avec curl : `curl http://localhost:3000/api/v1/mobilites`

### Le composant ne se charge pas
- Ouvrez la console navigateur (F12)
- Vérifiez que vous utilisez `onMounted()` pour les appels API
- Assurez-vous d'avoir `<ClientOnly>` autour du composant dans la page
