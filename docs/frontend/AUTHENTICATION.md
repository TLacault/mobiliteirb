# Authentification EirbConnect - Guide de mise en œuvre

## 📋 Vue d'ensemble

L'authentification EirbConnect a été mise en place en utilisant le protocole OpenID Connect (OAuth 2.0). Cette solution permet aux utilisateurs de se connecter avec leurs identifiants ENSEIRB-MATMECA.

## 🔧 Configuration

### Credentials (déjà configurés)

- **Server URL**: `https://connect.vpn.eirb.fr/realms/eirb`
- **Client ID**: `mobilit`
- **Client Secret**: `8oG9JgRg5vS2GO7CuM3JiDS5f4IcS1g4`

### URLs de redirection autorisées

Les URLs suivantes doivent être configurées dans EirbConnect :

- `http://localhost:8080/auth/callback` (développement)
- `https://mobilit.eirb.fr/auth/callback` (production)

## 🏗️ Architecture

### Fichiers créés

1. **`/frontend/composables/useAuth.ts`**
   - Composable Vue 3 pour gérer l'authentification
   - Fonctions : `login()`, `logout()`, `handleCallback()`, `checkAuth()`
   - État réactif de l'utilisateur

2. **`/frontend/pages/connexion.vue`**
   - Page de connexion avec interface utilisateur
   - Affichage des informations utilisateur après connexion
   - Bouton de connexion EirbConnect

3. **`/frontend/pages/auth/callback.vue`**
   - Page de callback OAuth
   - Traite le code d'autorisation
   - Gère les erreurs d'authentification

## 🔄 Flux d'authentification

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│  Utilisateur│         │  Application │         │ EirbConnect │
└──────┬──────┘         └──────┬───────┘         └──────┬──────┘
       │                       │                        │
       │ 1. Clic "Se connecter"│                        │
       ├──────────────────────>│                        │
       │                       │                        │
       │                       │ 2. Redirect to OAuth   │
       │                       ├───────────────────────>│
       │                       │                        │
       │                       │                        │
       │ 3. Login form         │                        │
       │<──────────────────────┼────────────────────────┤
       │                       │                        │
       │ 4. Submit credentials │                        │
       ├───────────────────────┼───────────────────────>│
       │                       │                        │
       │                       │ 5. Redirect with code  │
       │<──────────────────────┼────────────────────────┤
       │                       │                        │
       │ 6. Exchange code      │                        │
       │                       ├───────────────────────>│
       │                       │                        │
       │                       │ 7. Access token + JWT  │
       │                       │<───────────────────────┤
       │                       │                        │
       │                       │ 8. Get user info       │
       │                       ├───────────────────────>│
       │                       │                        │
       │                       │ 9. User data           │
       │                       │<───────────────────────┤
       │                       │                        │
       │ 10. Display user info │                        │
       │<──────────────────────┤                        │
```

## 🚀 Utilisation

### 1. Démarrer l'application

```bash
cd frontend
pnpm install
pnpm dev
```

L'application sera disponible sur `http://localhost:8080`

### 2. Se connecter

1. Naviguez vers `/connexion`
2. Cliquez sur "Se connecter avec EirbConnect"
3. Vous serez redirigé vers la page de connexion EirbConnect
4. Entrez vos identifiants ENSEIRB
5. Vous serez redirigé vers `/auth/callback`
6. Puis automatiquement vers `/connexion` avec vos informations affichées

### 3. Informations utilisateur disponibles

Après connexion, les informations suivantes sont accessibles :

```typescript
{
  sub: string;                  // ID unique de l'utilisateur
  email: string;                // Email
  email_verified: boolean;      // Email vérifié
  preferred_username: string;   // Nom d'utilisateur
  given_name: string;           // Prénom
  family_name: string;          // Nom de famille
  ecole?: string;               // École (si disponible)
  diplome?: string;             // Diplôme (si disponible)
}
```

## 🔐 Sécurité

### Protection CSRF

Le composable utilise un paramètre `state` aléatoire pour protéger contre les attaques CSRF :

```typescript
const state = generateRandomString(32);
sessionStorage.setItem('oauth_state', state);
```

Ce state est vérifié lors du callback.

### Stockage des tokens

- **Access Token** : Stocké dans `localStorage`
- **Refresh Token** : Stocké dans `localStorage` (si fourni)
- **User Info** : Stocké dans `localStorage` pour persistance

### Déconnexion

La fonction `logout()` :

1. Nettoie le localStorage
2. Réinitialise l'état utilisateur
3. Redirige vers l'endpoint de déconnexion EirbConnect

## 🧪 Tests

### Test en local

1. Assurez-vous que l'application tourne sur `http://localhost:8080`
2. Allez sur `/connexion`
3. Testez le flux complet de connexion

### Vérification des tokens

Vous pouvez décoder le JWT sur [jwt.io](https://jwt.io) pour vérifier son contenu.

### Test de la persistance

1. Connectez-vous
2. Rechargez la page
3. Vérifiez que vous restez connecté (la fonction `checkAuth()` est appelée au montage)

## 🐛 Dépannage

### Erreur "Invalid state parameter"

- Le state OAuth ne correspond pas
- Vérifiez que les cookies/sessionStorage sont activés
- Essayez en navigation privée

### Erreur "Failed to exchange code for token"

- Vérifiez que le client secret est correct
- Vérifiez que l'URL de callback est autorisée dans EirbConnect
- Vérifiez les logs réseau dans les DevTools

### Erreur "Failed to fetch user info"

- Le token d'accès est invalide ou expiré
- Vérifiez la connexion à EirbConnect

### CORS errors

- Assurez-vous que votre origin est dans la whitelist d'EirbConnect
- En développement, utilisez `http://localhost:8080`

## 📝 Notes importantes

1. **Port du serveur de développement** : L'application est configurée pour tourner sur le port `8080`. Si vous utilisez un autre port, mettez à jour :
   - `OPENID_CONFIG.redirectUri` dans `useAuth.ts`
   - Les URLs autorisées dans la console EirbConnect

2. **Production** : Pour la production, mettez à jour l'URL de callback dans la configuration EirbConnect pour pointer vers `https://mobilit.eirb.fr/auth/callback`

3. **VPN** : Pour accéder à la console admin EirbConnect, vous devez passer par `vpn.eirb.fr`

4. **Refresh tokens** : Le système supporte les refresh tokens si EirbConnect les fournit. Vous pouvez implémenter un mécanisme de rafraîchissement automatique si nécessaire.

## 🔄 Prochaines étapes suggérées

1. **Middleware de protection** : Créer un middleware Nuxt pour protéger les routes qui nécessitent une authentification

2. **Refresh automatique** : Implémenter le rafraîchissement automatique des tokens avant expiration

3. **Backend integration** : Envoyer le token au backend pour valider les requêtes API

4. **Gestion des rôles** : Si EirbConnect fournit des rôles, les utiliser pour la gestion des permissions

5. **Error tracking** : Intégrer un système de suivi d'erreurs (Sentry, etc.)

## 📞 Support

Pour toute question concernant EirbConnect, contactez Eirbware ou consultez la documentation sur le VPN EIRB.
