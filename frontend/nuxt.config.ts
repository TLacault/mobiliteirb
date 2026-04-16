// @ts-nocheck
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2026-01-31",
  devtools: { enabled: true },

  css: [
    "~/src/assets/reset.css",
    "~/src/assets/theme.css",
    "~/src/assets/popup.css",
    "~/src/assets/animations.css",
  ],

  // Configuration du serveur pour le développement
  devServer: {
    port: 8080,
    host: "0.0.0.0",
  },

  app: {
    baseURL: "/",
    head: {
      title: "Mobiliteirb",
      link: [
        {
          rel: "icon",
          type: "image/png",
          href: "/favicon/favicon-96x96.png",
          sizes: "96x96",
        },
        { rel: "icon", type: "image/svg+xml", href: "/favicon/favicon.svg" },
        { rel: "shortcut icon", href: "/favicon/favicon.ico" },
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/favicon/apple-touch-icon.png",
        },
        { rel: "manifest", href: "/favicon/site.webmanifest" },
      ],
      meta: [{ name: "apple-mobile-web-app-title", content: "Mobiliteirb" }],
    },
  },

  vite: {
    server: {
      hmr: {
        clientPort: 8080,
      },
      // En dev, proxie /api vers le backend local pour que les URLs relatives fonctionnent
      proxy: {
        "/api": process.env.NUXT_DEV_PROXY_TARGET || "http://localhost:3001",
      },
    },
  },

  // Configuration runtime
  runtimeConfig: {
    // Variables côté serveur uniquement
    public: {
      // Variables exposées côté client
      // URL relative : passe par nginx en prod, par le proxy Vite en dev
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "/api/v1",
      gmapsApiKey:
        process.env.NUXT_PUBLIC_GMAPS_API_KEY ||
        "AIzaSyBD89c9WF513gllD7Ig7yQHVQk6aISEbMs",
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
