<template>
  <div class="mobilities-page">
    <!-- Rendu côté client uniquement -->
    <ClientOnly>
      <MobilitiesList />
      <template #fallback>
        <div style="text-align: center; padding: 2rem">Chargement...</div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup>
// Configuration de la page
useHead({
  title: "Mes Mobilités",
  meta: [
    { name: "description", content: "Gérez vos mobilités internationales" },
  ],
});
</script>

<style scoped>
.mobilities-page {
  min-height: 100vh;
  background: #f5f5f5;
}
</style>
