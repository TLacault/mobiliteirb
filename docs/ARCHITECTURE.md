# 📘 Architecture & Guide de Déploiement - Mobilit'Eirb

Ce document résume l'architecture technique du projet, le flux de développement et la stratégie de déploiement sur l'infrastructure Eirbware.

---

## 🏗️ 1. Architecture Globale

Le projet repose sur une architecture **Dockerisée** composée de 3 services principaux interconnectés via un réseau privé Docker.

### Stack Technique
* **Frontend :** Vue.js 3 + Vite (Node 22).
* **Backend :** Node.js (Express) + TypeScript (ou JS) + Prisma ORM.
* **Database :** PostgreSQL + PostGIS (pour les données géographiques).
* **Infra :** Docker Compose & Make.

### Flux de Données
1.  **Frontend** : Sert l'interface utilisateur. En prod, c'est Nginx. En dev, c'est Vite.
2.  **Backend** : API REST qui traite la logique métier.
3.  **Database** : Stockage persistant des données utilisateurs et géographiques.

---

## 💻 2. Environnement de Développement

L'environnement local est conçu pour être "clé en main". Il simule la prod tout en permettant le *Hot-Reload* (mise à jour instantanée du code).

### Prérequis
* Docker & Docker Compose
* Make (optionnel mais recommandé)

### Commandes Rapides
| Commande | Action |
| :--- | :--- |
| `make install` | **Premier lancement** : Construit les images, installe les dépendances, lance la DB et les migrations. |
| `make up` | **Quotidien** : Lance tous les services (Front, Back, DB, Studio). |
| `make down` | Arrête les conteneurs. |
| `make clean` | **Attention** : Supprime tout (y compris la BDD) pour repartir de zéro. |

### Accès aux Services
* **Application (Frontend)** : [http://localhost:5173](http://localhost:5173)
* **API (Backend)** : [http://localhost:3000](http://localhost:3000)
* **Prisma Studio (Admin DB)** : [http://localhost:5555](http://localhost:5555) (Interface graphique pour voir les données)
* **Base de Données (Direct)** : Port `5433` (User: `user`, Pass: `password`, DB: `mobility_db`).

### Particularités du Code
* **Backend** : Utilise `node --watch` pour redémarrer automatiquement à chaque sauvegarde.
* **Prisma** : Le client est régénéré automatiquement au démarrage du conteneur (`dev` script) pour éviter les désynchronisations.

---

## 🚀 3. Architecture de Production (VPS)

En production, l'architecture change légèrement pour la performance et la sécurité.

### Infrastructure Eirbware
* **Serveur :** VPS Eirbware (Linux).
* **Reverse Proxy :** Le proxy de l'école gère le HTTPS (`mobilit.eirb.fr`) et redirige vers notre VPS.
* **Firewall :** Le port **10077** est ouvert pour recevoir le trafic du proxy de l'école.

### Différences Dev vs Prod
| Composant | Développement | Production |
| :--- | :--- | :--- |
| **Frontend** | Serveur Vite (Hot reload) | Serveur Nginx (Fichiers statiques compilés) |
| **Backend** | `node --watch` | `node index.js` (Optimisé) |
| **Ports** | Exposés localement | Seul le port 80 (mappé sur 10077) est ouvert |

---

## 🔄 4. Pipeline CI/CD & Déploiement

Le déploiement est automatisé via **GitHub Actions**.

### Le Workflow
1.  **Push sur `main`** : Déclenche l'action GitHub.
2.  **Build** : GitHub construit les images Docker (Front & Back).
3.  **Push Registry** : Les images sont envoyées sur le registre privé : `registry.eirb.fr/mobiliteirb/...`.

### Mise à jour du Serveur
Pour mettre à jour le site en production :
1.  Se connecter au VPS.
2.  Aller dans le dossier du projet.
3.  `docker compose pull` (Télécharge les nouvelles images).
4.  `docker compose up -d` (Relance les conteneurs avec la nouvelle version).

---

## 🛠️ 5. Dépannage Courant

* **Erreur "Prisma Client not initialized"** : Le client Prisma n'est pas sync.
    * *Solution :* `docker compose restart backend` (Le script de démarrage le régénérera).
* **Erreur de Port (Bind failed)** : Un port (3000, 5173, 5433) est déjà utilisé sur votre PC.
    * *Solution :* Coupez vos autres projets ou modifiez le `.env`.
* **Base de données vide après un redémarrage** : Vous avez probablement fait un `make clean` ou `down -v`.
    * *Solution :* `docker compose exec backend npx prisma migrate dev` pour recréer les tables.
