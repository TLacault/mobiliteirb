<template>
  <div class="page">
    <div class="container">
      <ImporterSection />

      <!-- Mobilities Section -->
      <div class="mobilities-section">
        <div class="title-container">
          <Map color="var(--primary)" size="40" />
          <h2 class="section-title gradient-cta">Vos Mobilités</h2>
        </div>
        <div class="cards-container">
          <MobilityCard
            v-for="mobility in mobilityIDs"
            :key="mobility.uuid"
            :uuid="mobility.uuid"
          />
          <MobilityCardNew />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Map } from "lucide-vue-next";

// Components
import ImporterSection from "../components/dashboard/ImporterSection.vue";
import MobilityCard from "../components/dashboard/MobilityCard.vue";
import MobilityCardNew from "../components/dashboard/MobilityCardNew.vue";

// API
import { getMobiliteUuids } from "../utils/mobiliteAPI.js";

// State
const mobilityIDs = ref([]);
const loading = ref(false);
const error = ref(null);

// Charge les mobilités depuis l'API
const loadData = async () => {
  loading.value = true;
  error.value = null;

  try {
    console.log("🔧 Fetching mobilités UUIDs...");
    mobilityIDs.value = await getMobiliteUuids();
    console.log("✅ Mobilities loaded:", mobilityIDs.value.length);
    console.log("📋 UUIDs:", mobilityIDs.value);
  } catch (e) {
    console.error("❌ Error loading mobilities:", e);
    error.value = e.message || "Erreur lors du chargement";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});

// Protéger cette page avec le middleware d'authentification
definePageMeta({
  middleware: "auth",
});

const { user } = useAuth();

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

/* Mobilites */

.mobilities-section {
  margin-top: 4rem;
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

.info-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  max-width: 600px;
}

.info-card h3 {
  font-family: var(--font-ubuntu);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 1.5rem;
}

.info-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-card li {
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  color: var(--text);
}

.info-card li:last-child {
  border-bottom: none;
}

.info-card li strong {
  color: #667eea;
  margin-right: 0.5rem;
}

/* DEUBG */

.debug-section {
  background: #f8f9fa;
  border: 2px dashed #667eea;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 5rem;
}

.debug-section h3 {
  font-family: var(--font-ubuntu);
  font-size: 1.3rem;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 1rem;
}

.uuid-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-family: monospace;
}

.uuid-list li {
  padding: 0.5rem;
  background: white;
  margin-bottom: 0.5rem;
  border-radius: 6px;
  color: var(--text);
  word-break: break-all;
}
</style>
