<script setup>
import { ref, onMounted } from "vue";
import TripCard from "./TripCard.vue";
import StepCard from "./StepCard.vue";
import { getMobilityTrips, updateTrip } from "../../utils/trip_api.js";
import { getStepsByTrip } from "../../utils/step_api.js";

const props = defineProps({
  mobilityId: {
    type: String,
    required: true,
  },
});

const loading = ref(true);
const error = ref(null);

// Each column: { trip: { id, name, isSelected, emissions, distance, steps, from, to }, steps: [...] }
const columns = ref([]);

async function loadData() {
  loading.value = true;
  error.value = null;
  try {
    const trips = await getMobilityTrips(props.mobilityId);
    const withSteps = await Promise.all(
      trips.map(async (trip) => {
        const steps = await getStepsByTrip(trip.id);
        const sorted = [...steps].sort(
          (a, b) => a.sequenceOrder - b.sequenceOrder,
        );
        return { trip, steps: sorted };
      }),
    );
    columns.value = withSteps;
  } catch (e) {
    error.value = e.message || "Erreur lors du chargement des trajets";
  } finally {
    loading.value = false;
  }
}

onMounted(loadData);

async function handleToggle(tripId, isSelected) {
  try {
    await updateTrip(tripId, { isSelected });
    const col = columns.value.find((c) => c.trip.id === tripId);
    if (col) col.trip.isSelected = isSelected;
  } catch (e) {
    console.error("Erreur lors de la mise à jour du trajet :", e);
  }
}

function handleStepDeleted(tripId, stepId) {
  const col = columns.value.find((c) => c.trip.id === tripId);
  if (!col) return;
  col.steps = col.steps.filter((s) => s.uuid !== stepId);
  col.trip.steps = col.steps.length;
}

function handleStepUpdated(tripId, updated) {
  const col = columns.value.find((c) => c.trip.id === tripId);
  if (!col) return;
  const idx = col.steps.findIndex((s) => s.uuid === updated.uuid);
  if (idx !== -1) col.steps.splice(idx, 1, { ...col.steps[idx], ...updated });
}
</script>

<template>
  <div class="trips-grid-wrapper">
    <div v-if="loading" class="grid-state">Chargement des trajets...</div>
    <div v-else-if="error" class="grid-state grid-error">{{ error }}</div>
    <div v-else-if="columns.length === 0" class="grid-state">
      Aucun trajet pour cette mobilité.
    </div>

    <div v-else class="trips-grid">
      <div
        v-for="(col, index) in columns"
        :key="col.trip.id"
        class="trip-column"
      >
        <!-- Column header: TripCard -->
        <TripCard
          :trip="col.trip"
          :index="index"
          @toggle="(val) => handleToggle(col.trip.id, val)"
        />

        <!-- Step cards stacked below -->
        <div class="steps-stack">
          <p v-if="col.steps.length === 0" class="no-steps">
            Aucune étape pour ce trajet.
          </p>
          <StepCard
            v-for="step in col.steps"
            :key="step.uuid"
            :step="step"
            @deleted="(id) => handleStepDeleted(col.trip.id, id)"
            @updated="(upd) => handleStepUpdated(col.trip.id, upd)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.trips-grid-wrapper {
  width: 100%;
}

.grid-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
  font-size: 0.95rem;
}

.grid-error {
  color: #ef4444;
}

/* Horizontal scrollable row */
.trips-grid {
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
  overflow-x: auto;
  padding-bottom: 1.5rem;
  align-items: flex-start;
}

/* One column per trip, width driven by TripCard (500px) */
.trip-column {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 500px;
  flex-shrink: 0;
}

.steps-stack {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.no-steps {
  text-align: center;
  color: #9ca3af;
  font-size: 0.875rem;
  padding: 1rem;
  border: 1px dashed #e5e7eb;
  border-radius: 10px;
}
</style>
