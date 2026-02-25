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
          <MobilityCard v-for="card in cards" :key="card.id" :m="card" />
          <MobilityCardNew />
        </div>
      </div>
      <div class="welcome-section">
        <h1>Dashboard</h1>
        <p class="welcome-message" v-if="user">
          Bonjour,
          <strong>{{ user.given_name }} {{ user.family_name }}</strong> 👋
        </p>
      </div>

      <div class="dashboard-content">
        <p>Start building your dashboard components here</p>

        <!-- Exemple de carte d'information utilisateur -->
        <div class="info-card" v-if="user">
          <h3>Vos informations</h3>
          <ul>
            <li><strong>Email :</strong> {{ user.email }}</li>
            <li><strong>Username :</strong> {{ user.preferred_username }}</li>
            <li v-if="user.ecole"><strong>École :</strong> {{ user.ecole }}</li>
            <li v-if="user.diplome">
              <strong>Diplôme :</strong> {{ user.diplome }}
            </li>
          </ul>
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

const API_BASE = "http://localhost:3000/api/v1";

const mobilities = ref([]);
const loading = ref(false);
const error = ref(null);

/**
 * Charge les mobilités depuis l'API
 */
const loadData = async () => {
  loading.value = true;
  error.value = null;

  try {
    console.log("🔧 Fetching from:", `${API_BASE}/mobilites`);
    mobilities.value = await $fetch(`${API_BASE}/mobilites`);
    console.log("✅ Mobilities loaded:", mobilities.value.length);
  } catch (e) {
    console.error("❌ Error loading mobilities:", e);
    error.value = e.message || "Erreur lors du chargement";
  } finally {
    loading.value = false;
  }
};

const cards = computed(() => {
  if (!mobilities.value) return [];
  else if (mobilities.value.length < 5) return mobilities.value;
  return mobilities.value.slice(0, 5);
});

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

.welcome-section {
  margin-bottom: 3rem;
}

h1 {
  font-family: var(--font-ubuntu);
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 1rem;
}

.welcome-message {
  color: var(--text);
  font-size: 1.3rem;
}

.welcome-message strong {
  color: #667eea;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.dashboard-content > p {
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
</style>
