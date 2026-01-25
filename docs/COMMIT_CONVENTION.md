# Convention des Messages de Commit

Pour maintenir un historique lisible et comprendre "qui a fait quoi et pourquoi" des semaines plus tard, nous suivons une version simplifiée de [Conventional Commits](https://www.conventionalcommits.org/)

## 📝 Le Format

Chaque message de commit doit respecter cette structure :

`TYPE(scope): Description courte et claire`

- `TYPE` : La nature du changement (voir liste ci-dessous).
- `(scope)` : Optionnel. Le fichier ou module concerné (ex: auth, header, db).
- `Description` : Ce qui a été fait, à l'impératif ou présent (ex: "Ajoute..." et non "A ajouté...").

## 🏷️ Les Types Autorisés

Utilisez ces préfixes pour catégoriser vos commits:

|Type|	Description|	Exemple|
|:--|:------------|:-------|
|**`feat`**|	Une nouvelle fonctionnalité (User Story).|`feat(map): ajoute le calcul de distance`|
|**`fix`**|	Correction d'un bug.	|`fix(api): corrige l'erreur 500 sur /login`|
|**`chore`**|	Tâche technique (Config, Docker, deps) sans impact code.|	`chore(docker): ajoute le service postgis`|
|**`docs`**|	Ajout ou modification de documentation.	|`docs: met à jour le README`|
|**`style`**|	Formatage, point-virgule manquant (pas de logique).|	`style(css): aligne les boutons du menu`|
|**`refactor`**|	Modification du code sans changer le comportement (optimisation).	|`refactor(back): simplifie la fonction de tri`|

## ✅ Les Bonnes Pratiques

### 1. Atomicité ⚛️

**Un commit = Une tâche précise**

- ❌ "Avance sur le projet" (contient du CSS, une modif DB et du JS).
- ✅ Faites 3 commits séparés (style, feat, fix).

### 2. `git add .` 🚫

N'utilisez jamais `git add .` à l'aveugle.
Vous risquez d'envoyer des **fichiers de config** locaux, des **.env** ou des fichiers temporaires.
Utilisez `git add <file_name>` ou votre IDE pour sélectionner les fichiers.

### 3. Commit souvent ⏱️

N'attendez pas d'avoir fini toute la feature pour commit.
Codez **1 partie logique = 1 Commit**.
Cela permet de revenir en arrière facilement sans tout perdre.

### 4. Référencer les Issues (Optionnel mais recommandé) 🔗

Si le commit ferme ou concerne un ticket précis, ajoutez la **référence** à la fin.
Exemple : `fix(front): alignement navbar (ref #42)`

## 💡 Exemples Concrets

- Une nouvelle feature Back :
`feat(api): crée la route GET /users`

- Une correction de style Front :
`style(home): change la couleur du bouton login`

- Mise à jour de la config Docker :
`chore: update node version to 18`
