import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue"; // C'est ici que ça change

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      "/api": {
        target: "http://backend:3000",
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, '') // Active cette ligne seulement si besoin
      },
    },
  },
});
