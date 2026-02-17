// @ts-nocheck
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2026-01-31",
  devtools: { enabled: true },

  // Configuration du serveur pour le développement
  devServer: {
    port: 5137,
    host: "0.0.0.0",
  },

  app: {
    baseURL: "/",
  },

  vite: {
    server: {
      hmr: {
        clientPort: 5137,
      },
    },
  },

  // Configuration runtime
  runtimeConfig: {
    // Variables côté serveur uniquement
    public: {
      // Variables exposées côté client
      // En dev: backend sur port 3000, en prod: proxy nginx
      apiBase:
        process.env.NUXT_PUBLIC_API_BASE || "http://localhost:3000/api/v1",
    },
  },

  // Modules recommandés pour Nuxt
  modules: [],

  // Configuration du routeur
  router: {
    options: {
      strict: false,
    },
  },

  // Configuration TypeScript
  typescript: {
    strict: true,
  },
});
