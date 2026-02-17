<template>
  <div>
    <Navbar />
    <NuxtPage />
    <EnjeuxSection />
  </div>
</template>

<script setup>
import Enjeux from './components/EnjeuxSection.vue';

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
