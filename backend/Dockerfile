FROM node:22-alpine as build-stage

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./

COPY prisma ./prisma/

RUN npm install

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node index.js"]
