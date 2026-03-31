# Colors
GREEN=\033[0;32m
BLUE=\033[0;34m
NC=\033[0m

.PHONY: help install up down clean logs seed seed-append db-reset erase-db

help:
	@echo "Commandes disponibles :"
	@echo "  make install      : Initialise le projet (copie .env, build images)"
	@echo "  make up           : Lance tout l'environnement de dev"
	@echo "  make down         : Arrête les conteneurs"
	@echo "  make logs         : Affiche les logs en temps réel"
	@echo "  make clean        : Supprime tout (volumes, images, node_modules locaux)"
	@echo "  make seed         : Remplit la base avec des données aléatoires (efface tout)"	@echo "  make seed-append  : Ajoute des données sans effacer l'existant"	@echo "  make db-reset     : Réinitialise la base et la remplit avec des données"
	@echo "  make erase-db     : Supprime toutes les données de la base (garde le schéma)"

install:
	@echo -e "${GREEN}=== Initialisation du projet ===${NC}"
	@if [ ! -f .env ]; then cp .env.example .env; echo "Fichier .env créé."; fi
	@echo -e "${GREEN}=== Construction des conteneurs ===${NC}"
	docker compose build
	@echo -e "${GREEN}=== Installation des dépendances (Backend & Frontend) ===${NC}"
	docker compose run --rm backend npm install
	docker compose run --rm frontend npm install
	@echo -e "${GREEN}=== Mise en place de la Base de Données ===${NC}"
	docker compose run --rm backend npx prisma db push
	@echo -e "${GREEN}=== Ready ! Run 'make up' to start. ===${NC}"
	@echo -e "${GREEN}💡 Pour remplir la base avec des données de test, exécutez : make seed${NC}"

up:
	@echo -e "${GREEN}=== Starting the environment ===${NC}"
	docker compose up -d
	@echo -e ""
	@echo -e " ${BLUE}➤ Frontend  http://localhost:8080${NC}"
	@echo -e " ${BLUE}➤ Backend   http://localhost:3001${NC}"
	@echo -e " ${BLUE}➤ Studio    http://localhost:5555${NC}"
	@echo -e " ${BLUE}➤ Swagger   http://localhost:3001/api/docs${NC}"

down:
	docker compose down

logs:
	docker compose logs -f

clean:
	docker compose down -v --rmi local
	rm -rf backend/node_modules frontend/node_modules

seed:
	@echo -e "${GREEN}=== Filling database with random data ===${NC}"
	docker compose run --rm backend npx prisma db push
	docker compose run --rm backend npm run seed
	@echo -e "${GREEN}=== Database seeded successfully! ===${NC}"

seed-append:
	@echo -e "${GREEN}=== Appending random data (no reset) ===${NC}"
	docker compose run --rm backend node prisma/seed-append.js
	@echo -e "${GREEN}=== Data appended successfully! ===${NC}"

db-reset:
	@echo -e "${GREEN}=== Resetting database and reseeding ===${NC}"
	docker compose run --rm backend npx prisma db push --force-reset
	docker compose run --rm backend npm run seed
	@echo -e "${GREEN}=== Database reset and seeded! ===${NC}"

erase-db:
	@echo -e "${GREEN}=== Erasing all data from database ===${NC}"
	docker compose run --rm backend npx prisma db push --force-reset
	@echo -e "${GREEN}=== All data erased! Database schema preserved. ===${NC}"
