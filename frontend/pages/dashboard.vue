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
          <MobilityCard v-for="card in cards" :key="card.id" />
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

const cards = [
  { id: 1, name: "Mobilité 1" },
  { id: 2, name: "Mobilité 2" },
  { id: 3, name: "Mobilité 3" },
  { id: 4, name: "Mobilité 4" },
  { id: 5, name: "Mobilité 5" },
]; // a remplacer par une requete API

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
