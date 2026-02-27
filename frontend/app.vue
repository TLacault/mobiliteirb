<template>
  <div>
    <Navbar />
    <NuxtPage />
    <Footer />
  </div>
</template>

<script setup>
import Footer from "./components/Footer.vue";

// Configuration globale de l'application
useHead({
  titleTemplate: "Mobiliteirb",
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

/* Import Popup Styles */
@import "./src/assets/popup.css";
</style>
