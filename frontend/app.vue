<template>
  <div>
    <Navbar />
    <NuxtPage />
    <Footer />
  </div>
</template>

<script setup>
import Footer from "./components/Footer.vue";

// Restaurer la session utilisateur depuis localStorage au chargement de l'app
const { checkAuth } = useAuth();
onMounted(async () => {
  await checkAuth();
});

// Configuration globale de l'application
useHead({
  titleTemplate: "%s - MobilitEirb",
  meta: [
    { charset: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
  ],
});
</script>

<style>
/* Import CSS Reset */
@import "./src/assets/reset.css";

/* Import Theme Variables */
@import "./src/assets/theme.css";
</style>
