# Frontend MobilitEirb - Nuxt 3

## 🎯 Migration vers Nuxt 3

Le frontend a été migré de Vite + Vue vers **Nuxt 3** pour bénéficier de :
- ✅ **SSR (Server-Side Rendering)** pour de meilleures performances et SEO
- ✅ **Vue Router intégré** avec routing automatique basé sur les fichiers
- ✅ **DevTools Nuxt** pour un debugging avancé
- ✅ **Auto-imports** des composants et composables
- ✅ **Écosystème riche** de modules et composants

## 📁 Structure du projet

```
frontend/
├── app.vue                 # Composant racine de l'application
├── nuxt.config.ts          # Configuration Nuxt
├── pages/                  # Pages de l'application (routing automatique)
│   └── index.vue          # Page d'accueil (/)
├── components/            # Composants réutilisables (auto-importés)
├── composables/           # Fonctions composables (auto-importées)
├── layouts/               # Layouts de pages
├── middleware/            # Middleware de routes
├── plugins/               # Plugins Vue/Nuxt
├── public/                # Assets statiques
└── server/                # API serveur Nuxt (optionnel)
```

## 🚀 Démarrage

### Développement local (avec Docker)

```bash
# Initialiser le projet
make install

# Lancer l'environnement de dev
make up

# Le frontend sera accessible sur http://localhost:3001
```

### Développement sans Docker

```bash
cd frontend
npm install
npm run dev
```

## 🔧 Configuration

### Variables d'environnement

Les variables d'environnement sont configurées dans `nuxt.config.ts` via `runtimeConfig` :

```typescript
runtimeConfig: {
  public: {
    apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api'
  }
}
```

Pour les utiliser dans vos composants :
```vue
<script setup>
const config = useRuntimeConfig()
const apiUrl = config.public.apiBase
</script>
```

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

Utilisez les composables Nuxt pour les requêtes :

```vue
<script setup>
// Fetch automatique avec cache et SSR
const { data, pending, error } = await useFetch('/api/users')

// Ou avec $fetch pour des appels manuels
const config = useRuntimeConfig()
const login = async (credentials) => {
  const response = await $fetch(`${config.public.apiBase}/auth/login`, {
    method: 'POST',
    body: credentials
  })
  return response
}
</script>
```

## 🛠️ Outils de développement

### Nuxt DevTools

Les DevTools Nuxt sont activés par défaut en dev. Accédez-y via :
- L'icône Nuxt en bas de votre navigateur
- Ou visitez `http://localhost:5137/__nuxt_devtools__/`

Fonctionnalités :
- 📊 Visualisation des pages et routes
- 🔍 Inspection des composables et état
- 📦 Analyse des modules et plugins
- 🎨 Éditeur de composants
- ⚡ Timeline de performance

### Hot Module Replacement (HMR)

Le HMR est automatique - vos modifications sont reflétées instantanément.

## 📦 Modules recommandés

Pour enrichir votre application, installez ces modules Nuxt :

```bash
# UI Component libraries
npm install @nuxt/ui                    # Nuxt UI
npm install @nuxtjs/tailwindcss        # TailwindCSS

# Icons
npm install @nuxt/icon                  # Icon library

# HTTP client
npm install @nuxtjs/axios              # Axios

# State management
npm install @pinia/nuxt pinia          # Pinia

# Authentication
npm install @sidebase/nuxt-auth        # Auth module
```

Puis ajoutez-les dans `nuxt.config.ts` :

```typescript
export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@nuxt/icon',
    '@pinia/nuxt'
  ]
})
```

## 🐳 Docker

### Développement
Le Dockerfile utilise un **multi-stage build** :
- Stage 1 : Installation et build
- Dev : Lance `npm run dev` avec hot-reload

### Production
Le serveur Nuxt SSR tourne sur le port **3000** en production.
Un reverse proxy Nginx route le trafic vers Nuxt (frontend:3000) et l'API (backend:3000).

## 📚 Ressources

- [Documentation Nuxt 3](https://nuxt.com)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Nuxt Modules](https://nuxt.com/modules)
- [Exemples Nuxt](https://nuxt.com/docs/examples/hello-world)

## 🔄 Changements par rapport à Vite

| Avant (Vite) | Après (Nuxt) |
|-------------|--------------|
| Port 5173 | Port 3001 |
| `VITE_API_URL` | `NUXT_PUBLIC_API_BASE` |
| SPA uniquement | SSR + SPA |
| Vue Router manuel | Routing automatique |
| `import` explicites | Auto-imports |
| Build → dist/ | Build → .output/ |
