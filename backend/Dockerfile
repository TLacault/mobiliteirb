FROM node:25-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

# Commande de démarrage par défaut (sera surchargée en dev)
CMD ["npm", "run", "start"]
