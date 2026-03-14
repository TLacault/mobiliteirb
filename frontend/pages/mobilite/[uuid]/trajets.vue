<script setup>
import MobiliteHeader from "../../../components/mobilite/MobiliteHeader.vue";
import { getMobility } from "../../../utils/mobility_api.js";
import { getTrips } from "../../../utils/trip_api.js";
import { getStepsByTrip } from "../../../utils/step_api.js";

definePageMeta({ middleware: "auth" });

const route = useRoute();
const uuid = computed(() => route.params.uuid);

const { selectMobilite, setLastTab } = useMobiliteSession();

// Marque la mobilité comme sélectionnée (mode édition) et mémorise l'onglet
onMounted(() => {
  selectMobilite(uuid.value);
  setLastTab(uuid.value, "trajets");
});

// Données de la mobilité
const mobility = ref(null);
const loading = ref(true);
const error = ref(null);

// Steps de tous les trajets
const stepUuids = ref([]);
const stepsLoading = ref(false);

const loadMobility = async () => {
  loading.value = true;
  error.value = null;
  try {
    mobility.value = await getMobility(uuid.value);
  } catch (e) {
    error.value = e.message || "Erreur lors du chargement";
  } finally {
    loading.value = false;
  }
};

const loadSteps = async () => {
  stepsLoading.value = true;
  try {
    const trips = await getTrips(uuid.value);
    const allSteps = await Promise.all(
      trips.map((t) => getStepsByTrip(t.uuid)),
    );
    stepUuids.value = allSteps.flat().map((s) => s.uuid);
  } catch (e) {
    console.error("Erreur lors du chargement des steps :", e);
  } finally {
    stepsLoading.value = false;
  }
};

onMounted(async () => {
  await loadMobility();
  await loadSteps();
});

useHead({
  title: computed(() => `Trajets — ${mobility.value?.name ?? "Mobilité"}`),
});

// Mise à jour locale des champs modifiés depuis le header
const handleUpdated = (patch) => {
  if (mobility.value) {
    Object.assign(mobility.value, patch);
  }
};
</script>

<template>
  <div class="scene-page">
    <div v-if="loading" class="loading-state">Chargement...</div>
    <div v-else-if="error" class="error-state">{{ error }}</div>
    <template v-else>
      <MobiliteHeader
        :uuid="uuid"
        :mobility="mobility"
        @updated="handleUpdated"
      />
      <div class="scene-content">
        <div class="steps-section">
          <h2 class="steps-title">Steps de cette mobilité</h2>
          <div v-if="stepsLoading" class="loading-state">
            Chargement des steps...
          </div>
          <div v-else-if="stepUuids.length === 0" class="empty-state">
            Aucun step trouvé.
          </div>
          <ul v-else class="steps-list">
            <li v-for="id in stepUuids" :key="id" class="step-uuid">
              {{ id }}
            </li>
          </ul>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.scene-page {
  min-height: calc(100vh - 73px);
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
}

.scene-content {
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
}

.loading-state,
.error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 73px);
  font-size: 1rem;
  color: #6b7280;
}

.error-state {
  color: #ef4444;
}

.steps-section {
  margin-top: 2rem;
}

.steps-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.steps-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.step-uuid {
  font-family: monospace;
  font-size: 0.875rem;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  color: #374151;
}

.empty-state {
  color: #9ca3af;
  font-size: 0.95rem;
}
</style>
