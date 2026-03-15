<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import {
  Route,
  Plus,
  GripVertical,
  ArrowDownAZ,
  Leaf,
  ListOrdered,
  Timer,
  Ruler,
  ChevronDown,
  Check,
} from "lucide-vue-next";
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

const sortOrder = ref("manual");

const sortOptions = [
  { value: "manual", label: "Manuel", icon: GripVertical },
  { value: "emissions", label: "Émissions CO₂", icon: Leaf },
  { value: "steps", label: "Nombre d'étapes", icon: ListOrdered },
  { value: "duration", label: "Durée", icon: Timer },
  { value: "distance", label: "Distance", icon: Ruler },
  { value: "alpha", label: "Alphabétique", icon: ArrowDownAZ },
];

const selectedOption = computed(
  () => sortOptions.find((o) => o.value === sortOrder.value) ?? sortOptions[0],
);

const isDropdownOpen = ref(false);
const dropdownRef = ref(null);

const closeDropdown = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  loadData();
  document.addEventListener("click", closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener("click", closeDropdown);
});
</script>

<template>
  <div class="trips-grid-wrapper">
    <div class="container">
      <!-- Section header -->
      <div class="section-header">
        <div class="section-header-left">
          <Route size="40" class="section-icon" />
          <h2 class="section-title gradient-cta">Trajets</h2>
          <button class="btn-new-trip">
            <Plus size="16" />
            Nouveau trajet
          </button>
        </div>

        <div class="section-header-right">
          <div ref="dropdownRef" class="sort-dropdown">
            <button
              class="sort-trigger"
              @click.stop="isDropdownOpen = !isDropdownOpen"
            >
              <component :is="selectedOption.icon" size="16" />
              <span>{{ selectedOption.label }}</span>
              <ChevronDown
                size="14"
                class="chevron"
                :class="{ open: isDropdownOpen }"
              />
            </button>

            <Transition name="dropdown">
              <div v-if="isDropdownOpen" class="sort-menu">
                <button
                  v-for="opt in sortOptions"
                  :key="opt.value"
                  class="sort-option"
                  :class="{ active: sortOrder === opt.value }"
                  @click="
                    sortOrder = opt.value;
                    isDropdownOpen = false;
                  "
                >
                  <component :is="opt.icon" size="16" class="opt-icon" />
                  <span>{{ opt.label }}</span>
                  <Check
                    v-if="sortOrder === opt.value"
                    size="14"
                    class="check-icon"
                  />
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <!-- Grid -->
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
          <TripCard
            :trip="col.trip"
            :index="index"
            @toggle="(val) => handleToggle(col.trip.id, val)"
          />

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
  </div>
</template>

<style scoped>
.trips-grid-wrapper {
  width: 100%;
}

.container {
  max-width: 1700px;
  margin: 0 auto;
}

/* ── Section header ─────────────────────────────── */

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
  padding-bottom: 1.5rem;
}

.section-header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.section-icon {
  color: var(--primary);
  flex-shrink: 0;
}

.btn-new-trip {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  height: 38px;
  padding: 0 1.1rem;
  border-radius: 100px;
  border: 1.5px solid var(--primary);
  background-color: transparent;
  color: var(--primary);
  font-size: var(--font-body);
  font-weight: 400;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
  margin-left: 1rem;
  white-space: nowrap;
}

.btn-new-trip:hover {
  background-color: var(--primary);
  color: white;
}

/* ── Sort dropdown ──────────────────────────────── */

.section-header-right {
  display: flex;
  align-items: center;
}

.sort-dropdown {
  position: relative;
}

.sort-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 38px;
  padding: 0 1rem;
  border-radius: 100px;
  border: 1.5px solid #e5e7eb;
  background-color: white;
  color: #374151;
  font-size: var(--font-body);
  font-weight: 400;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  white-space: nowrap;
}

.sort-trigger:hover {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px oklch(70.62% 0.139 158.37 / 10%);
}

.chevron {
  color: #9ca3af;
  transition: transform 0.2s ease;
  margin-left: 0.15rem;
}

.chevron.open {
  transform: rotate(180deg);
}

.sort-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 200px;
  background: white;
  border: 1.5px solid #e5e7eb;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 100;
}

.sort-option {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.65rem 1rem;
  border: none;
  background: transparent;
  color: #374151;
  font-size: var(--font-body);
  font-weight: 400;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.15s ease;
}

.sort-option:not(:last-child) {
  border-bottom: 1px solid #f3f4f6;
}

.sort-option:hover {
  background-color: #f9fafb;
}

.sort-option.active {
  color: var(--primary);
  font-weight: 500;
  background-color: oklch(70.62% 0.139 158.37 / 6%);
}

.opt-icon {
  flex-shrink: 0;
  color: #9ca3af;
}

.sort-option.active .opt-icon {
  color: var(--primary);
}

.check-icon {
  margin-left: auto;
  color: var(--primary);
  flex-shrink: 0;
}

/* dropdown open/close transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ── Grid states ────────────────────────────────── */

.grid-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
  font-size: 0.95rem;
}

.grid-error {
  color: #ef4444;
}

/* ── Trips grid ─────────────────────────────────── */

.trips-grid {
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
  padding-bottom: 1.5rem;
  align-items: flex-start;
}

.trip-column {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  max-width: 550px;
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
