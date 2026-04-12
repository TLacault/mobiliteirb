# Tests des Endpoints API

Ce fichier contient des exemples de commandes pour tester les endpoints de l'API.

## Prérequis

1. Le serveur backend doit être lancé : `npm start` ou `node index.js`
2. La base de données doit être accessible
3. Au moins un utilisateur doit exister dans la table `users`

## Obtenir un userId de test

Depuis le terminal backend :
```bash
docker exec -it mobilit-eirb-backend-1 npx prisma studio
```
Ou via une requête :
```bash
curl http://localhost:3001/users
```

## Tests des endpoints Mobilités

### 1. Créer une mobilité

```bash
curl -X POST http://localhost:3001/api/v1/mobilites \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Échange Erasmus",
    "start": "Bordeaux",
    "end": "Stockholm",
    "is_anonymous": false,
    "year": "2026-09-01",
    "userId": "REMPLACER_PAR_VOTRE_USER_ID"
  }'
```

**Réponse attendue** : Code 201 avec les données de la mobilité créée

### 2. Récupérer toutes les mobilités

```bash
curl http://localhost:3001/api/v1/mobilites
```

**Réponse attendue** : Code 200 avec un tableau de mobilités

### 3. Récupérer une mobilité par ID

```bash
curl http://localhost:3001/api/v1/mobilites/REMPLACER_PAR_ID
```

**Réponse attendue** :
- Code 200 avec les détails de la mobilité si elle existe
- Code 404 si la mobilité n'existe pas

### 4. Supprimer une mobilité

```bash
curl -X DELETE http://localhost:3001/api/v1/mobilites/REMPLACER_PAR_ID
```

**Réponse attendue** :
- Code 200 avec message de confirmation si suppression réussie
- Code 404 si la mobilité n'existe pas

## Tests d'erreurs

### Créer une mobilité sans données requises

```bash
curl -X POST http://localhost:3001/api/v1/mobilites \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test incomplet"
  }'
```

**Réponse attendue** : Code 400 avec message d'erreur indiquant les champs manquants

### Récupérer une mobilité inexistante

```bash
curl http://localhost:3001/api/v1/mobilites/id-qui-nexiste-pas
```

**Réponse attendue** : Code 404 avec message d'erreur

## Tester avec Postman ou Thunder Client

Si vous préférez une interface graphique :

1. **Thunder Client** (extension VS Code) - Recommandé
   - Installer l'extension Thunder Client
   - Créer une nouvelle requête
   - Importer les exemples ci-dessus

2. **Postman**
   - Télécharger Postman
   - Créer une collection "Mobilit-Eirb API"
   - Ajouter les requêtes avec les exemples ci-dessus

## Prochains endpoints à tester

Une fois implémentés, tester :
- [ ] `/api/v1/mobilites/:mobilite_id/trajets`
- [ ] `/api/v1/trajets/:id`
- [ ] `/api/v1/trajets/:trajet_id/etapes`
- [ ] `/api/v1/etapes/:id`
