# Etape de Build
FROM node:22-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
# Ici, le workflow GitHub aura déposé le fichier .env
COPY . .
RUN npm run build

# Etape de Production
FROM node:22-alpine as production-stage
WORKDIR /app

# Copier les fichiers nécessaires depuis le build
COPY --from=build-stage /app/.output /app/.output
COPY --from=build-stage /app/package.json /app/package.json

# Variables d'environnement pour Nuxt
ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

EXPOSE 3000

# Lancer le serveur Nuxt en mode production
CMD ["node", ".output/server/index.mjs"]
