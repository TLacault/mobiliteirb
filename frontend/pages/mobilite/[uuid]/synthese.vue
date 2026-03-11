<script setup>
import MobiliteHeader from "../../../components/mobilite/MobiliteHeader.vue";
import SyntheseStatsSection from "../../../components/mobilite/SyntheseStatsSection.vue";
import TripCard from "../../../components/mobilite/TripCard.vue";
import { Route } from "lucide-vue-next";
import { getMobility } from "../../../utils/mobility_api.js";
import { getMobilityTrips, updateTrip } from "../../../utils/trip_api.js";

definePageMeta({ middleware: "auth" });

const route = useRoute();
const uuid = computed(() => route.params.uuid);

const { selectMobilite, setLastTab } = useMobiliteSession();

// Marque la mobilité comme sélectionnée (mode édition) et mémorise l'onglet
onMounted(() => {
  selectMobilite(uuid.value);
  setLastTab(uuid.value, "synthese");
});

// Données de la mobilité
const mobility = ref(null);
const loading = ref(true);
const error = ref(null);

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

onMounted(loadMobility);

useHead({
  title: computed(() => `Synthèse — ${mobility.value?.name ?? "Mobilité"}`),
});

// Mise à jour locale des champs modifiés depuis le header
const handleUpdated = (patch) => {
  if (mobility.value) {
    Object.assign(mobility.value, patch);
  }
};

// Trips
const tripList = ref([]);
const tripLoading = ref(false);
const tripError = ref(null);

const fetchTrips = async () => {
  if (!uuid.value) return;
  tripLoading.value = true;
  tripError.value = null;
  try {
    tripList.value = await getMobilityTrips(uuid.value);
  } catch (e) {
    console.error("Error loading trips:", e);
    tripError.value = "Failed to load trips.";
  } finally {
    tripLoading.value = false;
  }
};

const toggleTripSelected = async (trip, val) => {
  const previous = trip.isSelected;
  trip.isSelected = val;
  try {
    await updateTrip(trip.id, { isSelected: val });
  } catch (e) {
    console.error("Erreur lors de la mise à jour de isSelected :", e);
    trip.isSelected = previous;
  }
};

onMounted(fetchTrips);
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

      <section class="scene-content">
        <SyntheseStatsSection :stats="mobility?.stats" />

        <div class="trip-container">
          <div class="trip-header">
            <Route color="var(--primary)" size="var(--font-section-title)" />
            <h3 class="section-title">Trajets</h3>
          </div>
          <p v-if="tripLoading" class="trips-state">Chargement...</p>
          <p v-else-if="tripError" class="trips-state trips-error">
            {{ tripError }}
          </p>
          <p v-else-if="tripList.length === 0" class="trips-state">
            Aucun trip enregistré.
          </p>
          <div v-else class="trips-list">
            <TripCard
              v-for="(trip, index) in tripList"
              :key="trip.id"
              :trajet="trip"
              :index="index"
              @toggle="(val) => toggleTripSelected(trip, val)"
            />
          </div>
        </div>
      </section>
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
  padding: 2rem 2rem;
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

.trip-container {
  padding: 3rem 0rem;
}

.trip-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem 0rem;
}

.trips-list {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(350px, 500px));
  justify-content: center;
}

.trips-state {
  color: #9ca3af;
  font-size: 0.9rem;
  text-align: center;
  padding: 2rem 0;
}

.trips-error {
  color: #ef4444;
}
</style>
