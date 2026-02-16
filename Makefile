# Colors
GREEN=\033[0;32m
NC=\033[0m

.PHONY: help install up down clean logs seed seed-append db-reset

help:
	@echo "Commandes disponibles :"
	@echo "  make install      : Initialise le projet (copie .env, build images)"
	@echo "  make up           : Lance tout l'environnement de dev"
	@echo "  make down         : Arrête les conteneurs"
	@echo "  make logs         : Affiche les logs en temps réel"
	@echo "  make clean        : Supprime tout (volumes, images, node_modules locaux)"
	@echo "  make seed         : Remplit la base avec des données aléatoires (efface tout)"
	@echo "  make seed-append  : Ajoute des données sans effacer l'existant"
	@echo "  make db-reset     : Réinitialise la base et la remplit avec des données"

install:
	@echo -e "${GREEN}=== Initialisation du projet ===${NC}"
	@if [ ! -f .env ]; then cp .env.example .env; echo "Fichier .env créé."; fi
	@echo -e "${GREEN}=== Construction des conteneurs ===${NC}"
	docker compose build
	@echo -e "${GREEN}=== Installation des dépendances (Backend & Frontend) ===${NC}"
	docker compose run --rm backend npm install
	docker compose run --rm frontend npm install
	@echo -e "${GREEN}=== Mise en place de la Base de Données ===${NC}"
	docker compose run --rm backend npx prisma migrate dev --name init_install
	@echo -e "${GREEN}=== Ready ! Run 'make up' to start. ===${NC}"

up:
	@echo -e "${GREEN}=== Starting the environment ===${NC}"
	docker compose up -d
	@echo -e "${GREEN}Frontend available at : http://localhost:5137${NC}"
	@echo -e "${GREEN}Backend available at  : http://localhost:3000${NC}"
	@echo -e "${GREEN}Studio available at   : http://localhost:5555${NC}"

down:
	docker compose down

logs:
	docker compose logs -f

clean:
	docker compose down -v --rmi local
	rm -rf backend/node_modules frontend/node_modules

seed:
	@echo -e "${GREEN}=== Filling database with random data ===${NC}"
	docker compose run --rm backend npm run seed
	@echo -e "${GREEN}=== Database seeded successfully! ===${NC}"

seed-append:
	@echo -e "${GREEN}=== Adding more data to existing database ===${NC}"
	docker compose run --rm backend npm run seed:append
	@echo -e "${GREEN}=== Data appended successfully! ===${NC}"

db-reset:
	@echo -e "${GREEN}=== Resetting database and reseeding ===${NC}"
	docker compose run --rm backend npx prisma migrate reset --force
	@echo -e "${GREEN}=== Database reset and seeded! ===${NC}"
