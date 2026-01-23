# Etape de Build
FROM node:22-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
# Ici, le workflow GitHub aura déposé le fichier .env
COPY . .
RUN npm run build

# Etape de Production
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
