# Etape de Build
FROM node:22-alpine as build-stage
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy dependency files
COPY package*.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy project files
COPY . .

# Build-time env vars (public config baked into the static bundle)
ARG NUXT_PUBLIC_GMAPS_API_KEY
ENV NUXT_PUBLIC_GMAPS_API_KEY=$NUXT_PUBLIC_GMAPS_API_KEY

# Generate static site
RUN pnpm run generate

# Etape de Production
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/.output/public /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
