# 🔐 Gestion des secrets avec Git-secret

Git-secret est utilisé pour partager des fichiers sensibles (mots de passe, tokens, clés API) sans jamais les stocker en clair dans le dépôt.

🎯 **Objectif :** garder un workflow simple tout en évitant les fuites de secrets dans Git.

✅ **Quand utiliser git-secret :**

- Quand un fichier doit être partagé entre membres de l'équipe et qu'il contient des données sensibles
- Quand vous voulez versionner une version chiffrée dans le dépôt

❌ **Ne pas utiliser git-secret pour :**

- Des secrets temporaires purement locaux non partagés
- Des secrets de production gérés par une plateforme dédiée (Vault, Secrets Manager, etc.)

## 📋 Prérequis

- Git et Git-secret installés
- GPG installé et une clé GPG personnelle générée

### Génération d'une clé GPG

```bash
gpg --full-generate-key
```

- Type de clé : option par défaut (`RSA and RSA`)
- Taille de la clé : `4096` pour une sécurité maximale
- Validité : durée de validité (`0` : n'expire jamais, `1y` : un an)
- Identité :
  - Nom réel : votre Prénom et Nom
  - Adresse mail : email utilisé pour vos commit Git (celui donné à `git secret tell`)
  - Commentaire : peut rester vide (facultatif)
- Passphrase : saisissez un mot de passe (il sera demandé à chaque `git secret reveal`)

## 🚀 Initialisation dans un dépôt

A faire une seule fois par dépôt !

```bash
cd <repo>
git secret init
git secret tell email.dev@exemple.com
```

💡 **Commandes utiles :**

- `git secret whoknows`: liste les personnes autorisées à déchiffrer
- `git secret list`: liste les fichiers suivis par git-secret
- `gpg --list-secret-keys --keyid-format LONG` : vérifie que votre clé est bien disponible

## 🔄 Workflow standard (équipe)

### 1. ➕ Ajouter un nouveau fichier sensible

Exemple avec un fichier d'environnement :

```bash
git secret add .env
git secret hide
```

**Résultat :**

- `.env` reste local (en clair, non versionné)
- `.env.secret` est généré et doit être commit

**Commit recommandé :**

```bash
git add .gitsecret .env.secret
git commit -m "chore(secrets): add encrypted env file"
git push
```

### 2. 📝 Mettre à jour un secret existant

**Regénérer la version chiffrée du .env après une modification en local :**

```bash
git secret hide
```

Commiter la version chiffrée :

```bash
git add .env.secret
git commit -m "chore(secrets): update encrypted env"
```

### 3. 📥 Récupérer les secrets après un clone

```bash
git pull
git secret reveal
```

Si votre clé est protégée par passphrase, GPG la demandera.

### 4. 👥 Ajouter un membre à l'accès secrets

```bash
git secret tell nouvel.utilisateur@exemple.com
git secret reveal
git secret hide

git add .gitsecret/keys .env.secret
git commit -m "chore(secrets): grant access to new member"
```

Pourquoi `reveal` puis `hide` ?

- `hide` rechiffre les secrets pour inclure la nouvelle clé publique.

### 5. 🚫 Retirer l'accès d'un membre

Selon la version de git-secret:

```bash
git secret removeperson ancien.utilisateur@exemple.com
# ou (anciennes versions)
# git secret killperson ancien.utilisateur@exemple.com

git secret reveal
git secret hide

git add .gitsecret/keys .env.secret
git commit -m "chore(secrets): revoke access"
```

## 🤝 Intégration avec le projet

Ce dépôt utilise Docker Compose et un fichier `.env` à la racine pour la configuration locale.

Contexte actuel :

- `.env` est ignoré par Git (voir `.gitignore`)
- `make install` crée `.env` à partir de `.env.example` si absent

Recommandation projet :

1. Garder `.env.example` sans secrets réels (valeurs factices)
2. Partager la version réelle via `.env.secret` avec git-secret
3. Chaque développeur fait `git secret reveal` après clone/pull pour générer son `.env` local

Exemple de première mise en place :

```bash
cp .env.example .env
# remplir .env avec les vraies valeurs (si nécessaire)

git secret add .env
git secret hide

git add .gitsecret .env.secret
git commit -m "chore(secrets): initialize encrypted shared env"
```

## 🛡️ Règles de sécurité

- Ne commitez jamais un secret en clair
- Évitez `git add .` sur les changements sensibles, préférez `git add` ciblé
- Si un secret a fuité dans l'historique Git, considérez-le compromis et régénérez-le (rotation) immédiatement

✅ **Checklist avant un push :**

- `.env` n'est pas stagé
- `.env.secret` est à jour après `git secret hide`
- Les clés d'accès dans `.gitsecret/keys` reflètent l'équipe active

## 🛠️ Dépannage

### ❌ Erreur : `"gpg: decryption failed: No secret key"`

**Cause possible :** la clé privée correspondant à votre email/clé publique n'est pas présente localement.

**Actions :**

- Vérifiez vos clés: `gpg --list-secret-keys`
- Importez la bonne clé privée
- Revalider votre identité GPG utilisée avec git-secret

### ❌ Erreur : `"git secret reveal" ne trouve pas de fichiers`

**Causes possibles :**

- Aucun fichier n'a été ajouté via `git secret add`
- Les fichiers `.secret` ne sont pas présents après pull

**Actions :**

```bash
git secret list
ls -la *.secret
```

### ❌ Un membre ajouté ne peut pas déchiffrer

**Cause possible :** les fichiers n'ont pas été rechiffrés après `tell`.

**Actions :**

```bash
git secret reveal
git secret hide
git add .gitsecret/keys .env.secret
git commit -m "chore(secrets): re-encrypt for team"
```

## 📜 Convention équipe recommandée

- Un commit dédié pour les changements de secrets.
- Message de commit clair, ex:
  - `chore(secrets): update encrypted env`
  - `chore(secrets): grant access to <name>`
  - `chore(secrets): revoke access`
- Revue attentive des PR qui modifient `.gitsecret` ou des fichiers `.secret`.

## Références utiles

- Documentation git-secret : https://sobolevn.me/git-secret/
- Meilleurs pratiques : https://blog.gitguardian.com/secrets-api-management/
