# Pourquoi Client-Side Only ? (Pas de SSR)

> Document de décision d'architecture pour comprendre pourquoi nous n'utilisons pas le SSR de Nuxt dans ce projet.

## 🎯 Décision

**Nous utilisons Nuxt 3 en mode Client-Side Rendering (CSR) uniquement, sans Server-Side Rendering (SSR).**

## 🤔 Contexte

### Configuration Docker actuelle

```yaml
# docker-compose.yml
services:
  backend:
    ports:
      - "3000:3000"  # API Express

  frontend:
    ports:
      - "5137:3000"  # Nuxt Dev Server

  postgres:
    ports:
      - "5433:5432"  # PostgreSQL
```

Chaque service tourne dans **son propre conteneur** avec **son propre réseau local**.

### Problème avec SSR

Quand Nuxt fait du SSR, il exécute le code Vue **côté serveur** (dans le conteneur frontend) AVANT de l'envoyer au navigateur.

**Scénario problématique** :
1. Utilisateur visite `http://localhost:5137/mobilites`
2. Nuxt SSR essaie d'exécuter le code côté serveur
3. Le code appelle `http://localhost:3000/api/v1/mobilites`
4. ❌ **Erreur !** `localhost:3000` dans le conteneur frontend **≠** `localhost:3000` sur la machine hôte

### Visualisation du problème

```
┌─────────────────────────────────────────────┐
│ Machine Hôte (localhost)                    │
│                                             │
│  ┌──────────────┐      ┌──────────────┐   │
│  │ Frontend     │      │ Backend      │   │
│  │ Container    │  ✗   │ Container    │   │
│  │              │──────│              │   │
│  │ localhost !== localhost              │   │
│  │ (network A)  │      │ (network B)  │   │
│  └──────────────┘      └──────────────┘   │
│         │                                   │
│         │ SSR essaie : localhost:3000      │
│         ↓ (cherche dans network A)         │
│        ❌ Not found!                        │
└─────────────────────────────────────────────┘
```

Mais depuis le **navigateur** (sur l'hôte), `localhost:3000` fonctionne parfaitement !

```
┌─────────────────────────────────────────────┐
│ Machine Hôte (localhost)                    │
│                                             │
│  👤 Navigateur                              │
│     │                                       │
│     ├──✓ localhost:5137 → Frontend         │
│     └──✓ localhost:3000 → Backend          │
│                                             │
│  Les deux fonctionnent car ports mappés !  │
└─────────────────────────────────────────────┘
```

## 💡 Solution Retenue : Client-Side Only

Nous faisons **tous les appels API depuis le navigateur** après le chargement de la page.

```vue
<script setup>
const API_BASE = 'http://localhost:3000/api/v1';

// ⚠️ PAS d'appel au top-level (SSR)
// const { data } = await useFetch(...) ❌

// ✅ Appel dans onMounted (client-side uniquement)
onMounted(async () => {
  const data = await $fetch(`${API_BASE}/mobilites`);
});
</script>
```

### Pourquoi ça marche ?

- `onMounted()` s'exécute **uniquement dans le navigateur**
- Depuis le navigateur, `localhost:3000` pointe vers l'hôte
- Le mapping de ports Docker (`3000:3000`) permet la connexion

## 🔄 Alternatives Envisagées

### Alternative 1 : Réseau Docker interne

**Principe** : Configurer un réseau Docker où les conteneurs communiquent par noms de services.

```yaml
services:
  backend:
    networks:
      - app-network

  frontend:
    networks:
      - app-network
    environment:
      # SSR utiliserait : http://backend:3000
      API_URL_SSR: http://backend:3000
      # Browser utiliserait : http://localhost:3000
      API_URL_CLIENT: http://localhost:3000
```

**Problèmes** :
- ❌ Complexité accrue
- ❌ Configuration différente SSR vs Client
- ❌ Difficile à déboguer
- ❌ Over-engineering pour un projet étudiant

### Alternative 2 : Tout en SSR avec service names

**Principe** : Utiliser uniquement des noms de services Docker.

```javascript
const API_BASE = 'http://backend:3000/api/v1';
```

**Problèmes** :
- ❌ Ne fonctionne pas depuis le navigateur !
- ❌ `backend` n'est pas résolvable côté client
- ❌ Nécessiterait un proxy inversé (encore plus complexe)

### Alternative 3 : Tout déployer sur l'hôte (sans Docker)

**Principe** : Backend et Frontend tournent directement sur la machine hôte.

**Problèmes** :
- ❌ Perd les avantages de Docker (isolation, reproducibilité)
- ❌ Problèmes de dépendances entre développeurs
- ❌ Pas de parité dev/prod

## ✅ Avantages de notre approche

### 1. **Simplicité**
```vue
<!-- Simple et prévisible -->
<script setup>
onMounted(() => {
  $fetch('http://localhost:3000/api/v1/mobilites');
});
</script>
```

### 2. **Cohérence**
- Une seule URL API pour tous les appels
- Pas de confusion SSR vs Client

### 3. **Debugging facile**
- Ouvrir DevTools → Network
- Voir exactement les requêtes HTTP
- Tester avec curl facilement

### 4. **Docker simple**
- Pas besoin de réseau interne complexe
- Configuration minimale

### 5. **Acceptable pour ce projet**
- Pas de besoin SEO critique (app interne étudiante)
- Performance suffit largement
- Focus sur les fonctionnalités, pas l'infrastructure

## ⚠️ Limitations (acceptables)

### 1. Pas de SEO optimal

**Impact** : Les moteurs de recherche voient le HTML initial SANS les données.

**Pourquoi acceptable ?**
- Application interne étudiante
- Pas d'objectif de référencement Google
- Pas de contenu public à indexer

### 2. Temps de chargement initial

**Impact** :
1. Page HTML charge
2. JavaScript charge
3. Requête API
4. Affichage des données

vs SSR :
1. Page HTML avec données pré-rendues

**Pourquoi acceptable ?**
- Différence négligeable sur réseau local
- API très rapide (même machine)
- Expérience utilisateur reste fluide

### 3. Pas de fallback JavaScript désactivé

**Impact** : Si JavaScript désactivé, rien ne s'affiche.

**Pourquoi acceptable ?**
- Utilisateurs modernes ont JS activé
- Application web moderne nécessite JS de toute façon
- Pas une exigence du projet

## 📊 Comparaison

| Critère | SSR | Client-Only | Vainqueur |
|---------|-----|-------------|-----------|
| **Simplicité code** | ⚠️ Moyen | ✅ Simple | Client |
| **Config Docker** | ❌ Complexe | ✅ Simple | Client |
| **Debugging** | ⚠️ Moyen | ✅ Facile | Client |
| **SEO** | ✅ Excellent | ❌ Basique | SSR |
| **Temps initial** | ✅ Rapide | ⚠️ Moyen | SSR |
| **Pertinence projet** | ❌ Overkill | ✅ Suffisant | Client |

## 🎓 Apprentissages

### Ce que nous avons appris

1. **Docker networking** : Comprendre que `localhost` est relatif au conteneur
2. **SSR vs CSR** : Savoir quand utiliser chaque approche
3. **Trade-offs** : Équilibrer complexité et bénéfices
4. **Pragmatisme** : Choisir la solution adaptée au contexte

### Quand utiliser SSR ?

✅ **Utiliser SSR si** :
- SEO critique (site e-commerce, blog, vitrine)
- Performance initiale cruciale
- Contenu public à indexer
- Budget temps/complexité disponible

❌ **Éviter SSR si** :
- Application interne
- Pas besoin de SEO
- Configuration Docker complexe
- Projet avec deadline serrée

## 💡 Pour aller plus loin (optionnel)

Si vous voulez vraiment implémenter SSR + Docker :

1. **Créer un réseau Docker** :
```yaml
networks:
  app-network:
    driver: bridge
```

2. **Utiliser des variables d'environnement différenciées** :
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    // Server-side (SSR)
    apiBaseServer: process.env.API_BASE_SERVER || 'http://backend:3000',

    public: {
      // Client-side (Browser)
      apiBaseClient: process.env.API_BASE_CLIENT || 'http://localhost:3000'
    }
  }
})
```

3. **Détection dans le code** :
```javascript
const config = useRuntimeConfig();
const apiBase = process.server
  ? config.apiBaseServer
  : config.public.apiBaseClient;
```

**Mais encore une fois** : c'est de l'over-engineering pour ce projet.

## 📚 Références

- [Nuxt 3 Data Fetching](https://nuxt.com/docs/getting-started/data-fetching)
- [Docker Networking](https://docs.docker.com/network/)
- [Why CSR vs SSR](https://web.dev/rendering-on-the-web/)

## 🎯 Conclusion

**Client-Side Only est le bon choix pour MOBILIT'EIRB** car :
- ✅ Simple à implémenter
- ✅ Simple à maintenir
- ✅ Simple à déboguer
- ✅ Répond aux besoins du projet
- ✅ Permet de se concentrer sur les fonctionnalités

Le SSR serait du **gold-plating** (sur-ingénierie) à ce stade.
