<template>
  <div class="container">
    <h1>Bienvenue sur MobilitEirb</h1>
    <p>Plateforme de mobilité pour l'ENSEIRB-MATMECA</p>

    <div class="info-box">
      <h2>À propos</h2>
      <p>Cette application utilise :</p>
      <ul>
        <li>✅ Nuxt 3 avec SSR</li>
        <li>✅ Vue 3 avec Composition API</li>
        <li>✅ Vue Router intégré</li>
        <li>✅ Outils de développement Nuxt</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
// Configuration SEO pour cette page
useHead({
  title: "Accueil",
});

// Configuration du runtime pour récupérer l'URL de l'API
const config = useRuntimeConfig();
console.log("API URL:", config.public.apiBase);
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

h1 {
  color: #2c3e50;
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.info-box {
  background: #f4f4f4;
  border-radius: 8px;
  padding: 2rem;
  margin-top: 2rem;
  text-align: left;
}

.info-box h2 {
  color: #35495e;
  margin-bottom: 1rem;
}

ul {
  list-style: none;
  padding-left: 0;
}

li {
  margin: 0.5rem 0;
  font-size: 1.1rem;
}
</style>
