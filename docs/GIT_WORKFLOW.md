# Gestion de Projet & Workflow Git

Ce document décrit comment nous collaborons sur le dépôt GitHub. L'objectif est de travailler en parallèle sans casser le travail des autres.

## 1. Stratégie de Branches (Gitflow Simplifié)

Nous utilisons une structure stricte pour garantir la stabilité du code.

### 🛡️ Les Branches Principales (Protégées)
Ces branches existent en permanence. **Interdiction de push directement dessus.**

- **`main`** : **Production** 📦
C'est la version stable, déployée et fonctionnelle. On n'y touche que via une Pull Request validée.

- **`develop`** : **Intégration** 💻
C'est notre branche de travail commune. Toutes les nouvelles fonctionnalités y sont fusionnées pour être testées ensemble.

### ⏳ Les Branches Temporaires

**C'est ici que vous travaillez**.
> Une branche = Une tâche du Kanban.
Naming convention : **kebab-case**

- **`feat/nom-de-la-feature` : Feature** 🎯
Pour ajouter une nouveauté (ex: `feat/login-auth`). Créée depuis `develop`.
.
- **`fix/nom-du-bug` : Bugfix** 🚧
Pour corriger un problème (ex: `fix/css-header`). Créée depuis `develop`.
.
- **`chore/nom-de-la-tache` : Tâche Générale** 🔧
Pour de la config, du Docker, ou du nettoyage.

---

## 2. Workflow : De l'idée au Code

### Step 1 : Le Kanban (GitHub Project)

Avant de coder, assurez-vous qu'une carte existe dans le tableau.
1.  **Backlog** : Le réservoir d'idées.
2.  **To Do** : Ce qui a été sélectionné pour le sprint actuel.
3.  **In Progress** : **Déplacez votre carte ici** quand vous commencez à coder.

### Step 2 : Créer sa branche

Mettez-vous toujours à jour avant de créer votre branche :
```bash
git switch develop
git pull origin develop
git switch -c feat/ma-super-feature
```

### Step 3 : Développement

Codez, testez en local. Faites des commits réguliers - voir [COMMITS.md](./COMMITS.md)

### Step 4 : Pull Request (PR)

Une fois la fonctionnalité terminée :
1. Poussez votre branche : `git push origin feat/ma-super-feature`
2. Allez sur **GitHub** et ouvrez une **Pull Request** vers `develop`
3. Liez la PR au ticket (ex: `"Closes #12"`).
4. Déplacez la carte **Kanban** dans la colonne **Review / PR**.

### Step 5 : Validation & Merge

Un autre membre de l'équipe doit relire le code aka **Code Review**
Si tout est bon (et que la **CI** passe), on fusionne ( **Merge** ) dans `develop`.
La carte passe dans la colonne **Done**.

---

## Cas Particuliers 🚨

Il y a un bug critique en Prod sur la main !
Ne pas passer par develop.

- **Créer une branche** depuis `main` : `hotfix/correction-urgente`

- **Corriger** et **tester**.

- **Fusionner** vers `main` ET vers `develop` (pour ne pas perdre le correctif au prochain déploiement)

- **Conflit de fusion** (Merge Conflict)
Si GitHub vous dit "Can't merge automatically", c'est que develop a bougé pendant que vous codiez.
    - En local sur votre branche : `git merge develop`
    - Réglez les conflits dans votre éditeur.
    - Committez le résultat et pushez.

---

## Resources Utiles

- [Guide Gitflow](https://www.atlassian.com/fr/git/tutorials/comparing-workflows/gitflow-workflow)

- [Créer une Pull Request](https://docs.github.com/fr/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request)

- [Learn Git Branching](https://learngitbranching.js.org/) - Un super outil interactif pour maîtriser Git.
