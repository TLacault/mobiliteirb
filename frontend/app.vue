<template>
  <div>
    <Navbar />
    <NuxtPage />
    <Footer />
    <NotificationPopup />
  </div>
</template>

<script setup>
import Footer from "./components/Footer.vue";
import NotificationPopup from "./components/NotificationPopup.vue";

// Configuration globale de l'application
useHead({
  titleTemplate: "Mobiliteirb",
  meta: [
    { charset: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
  ],
});
</script>
