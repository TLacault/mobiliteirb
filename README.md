# MOBILIT'EIRB

### PFA - ENSEIRB 2026

**MOBILIT'EIRB** est une application qui permet de calculer l'**empreinte carbone** de vos déplacements lors de votre mobilité étudiante.
En entrant vos trajets, l'application vous fournit une estimation de l'**impact environnemental** de vos choix de transport et vous propose des **alternatives plus écologiques**.


---

### Usage

Pour lancer le projet en local, assurez-vous d'avoir **Docker** et **Make** installés, puis exécutez :

```bash
make install  # Premier lancement
make up       # Lancer les services
```

Pour arrêter les services, utilisez :

```bash
make down
```

Pour effacer les volumes de données (base de données, code synchronisé), utilisez :

```bash
make clean
```

### Database Seeding

Pour remplir la base de données avec des données de test aléatoires :

```bash
make seed         # Efface et remplit la base avec des données aléatoires
make db-reset     # Réinitialise tout et reseed
```

📚 **Documentation complète** : [backend/SEEDING.md](./backend/SEEDING.md)
📋 **Référence rapide** : [backend/SEEDING_QUICKREF.md](./backend/SEEDING_QUICKREF.md)

### Workflow & Architecture

Ce projet suit une architecture **client-serveur** avec une base de données PostgreSQL.
Le frontend est développé avec **Vue.js** et le backend avec **Node.js** et **Prisma** pour la gestion de la base de données.

Pour plus de détails, consultez le fichier [**workflow.md**](./docs/workflow.md) et [**ARCHITECTURE.md**](./docs/ARCHITECTURE.md).

### Authors

| Nom             | Contact                          |
|-----------------|----------------------------------|
| Eve     Turchet | eve.turchet@enseirb-matmeca.fr   |
| Mano    Domingo | mano.domingo@enseirb-matmeca.fr  |
| Margaux Lopez   | margaux.lopez@enseirb-matmeca.fr |
| Tim     Lacault | tim.lacault@enseirb-matmeca.fr   |
| Yoann   Moresco | yoann.moresco@enseirb-matmeca.fr |
