<template>
  <div class="page">
    <div class="container">
      <h1>Home - Landing Page</h1>
      <p>Start building your landing page components here</p>
      <EnjeuxSection />
    </div>
  </div>
</template>

<script setup>
useHead({
  title: "Accueil",
});
</script>

<style scoped>
.page {
  min-height: calc(100vh - 73px);
  padding: 3rem 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

h1 {
  font-family: var(--font-ubuntu);
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 1rem;
}

p {
  color: var(--text);
  opacity: 0.7;
  font-size: 1.1rem;
}
</style>
