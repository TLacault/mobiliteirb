<template>
  <div class="page">
    <div class="container">
      <ImporterSection />

      <!-- Mobilitie Cards Section -->
      <div class="mobilities">
        <div class="title-container">
          <Map color="var(--primary)" size="40" />
          <h2 class="section-title gradient-cta">Vos Mobilités</h2>
        </div>
        <div class="cards-container">
          <MobilityCard 
            v-for="card in cards" 
            :key="card.id" 
            :m="card"
          />
          <MobilityCardNew />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Map } from "lucide-vue-next";
import ImporterSection from "../components/dashboard/ImporterSection.vue";
import MobilityCard from "../components/dashboard/MobilityCard.vue";
import MobilityCardNew from "../components/dashboard/MobilityCardNew.vue";

const { data: allMobilities } = await useFetch('http://localhost:3000/api/v1/mobilites');

const currentUserId = computed(() => "7dc4d757-4b30-4742-8055-a8a11e918ad3"); 
// Récupérer l'id de l'utilisateur courant par une requête

const cards = computed(() => {
  if (!allMobilities.value) return [];
  return allMobilities.value.filter(m => m.userId === currentUserId.value);
});

useHead({
  title: "Dashboard",
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

.title-container {
  padding: 2rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.cards-container {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(
    auto-fit,
    minmax(350px, 500px)
  ); /* 550px : size max of MobilityCard */
  justify-content: center;
}
</style>