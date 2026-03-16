<script setup>
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from "vue";
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
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-vue-next";
import TripCard from "./TripCard.vue";
import StepCard from "./StepCard.vue";
import PopupCreateTrip from "../popup/PopupCreateTrip.vue";
import {
  getMobilityTrips,
  createTrip,
  updateTrip,
  deleteTrip,
} from "../../utils/trip_api.js";
import {
  getStepsByTrip,
  updateStep,
  createStep,
} from "../../utils/step_api.js";

const props = defineProps({
  mobilityId: {
    type: String,
    required: true,
  },
});

const loading = ref(true);
const error = ref(null);

const showNewTripPopup = ref(false);
const creatingStepTripIds = ref(new Set());

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

async function handleCreateTrip() {
  showNewTripPopup.value = true;
}

async function handleTripSubmitted(tripName) {
  try {
    await createTrip(props.mobilityId, tripName);
    await loadData();
    await nextTick();
    updateScrollState();
  } catch (e) {
    console.error("Erreur lors de la création du trajet :", e);
    alert("Erreur lors de la création du trajet");
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

async function handleTripUpdated(tripId, patch) {
  try {
    const updated = await updateTrip(tripId, patch);
    const col = columns.value.find((c) => c.trip.id === tripId);
    if (!col) return;
    col.trip = { ...col.trip, ...patch, ...(updated || {}) };
  } catch (e) {
    console.error("Erreur lors de la mise à jour du trajet :", e);
  }
}

async function handleTripDeleted(tripId) {
  try {
    await deleteTrip(tripId);
    columns.value = columns.value.filter((c) => c.trip.id !== tripId);
    await nextTick();
    updateScrollState();
  } catch (e) {
    console.error("Erreur lors de la suppression du trajet :", e);
  }
}

async function handleStepDeleted(tripId, stepId) {
  const col = columns.value.find((c) => c.trip.id === tripId);
  if (!col) return;

  const nextSteps = col.steps.filter((s) => s.uuid !== stepId);
  if (nextSteps.length === col.steps.length) return;

  const stepsToPatch = [];
  col.steps = nextSteps.map((step, index) => {
    const newSequenceOrder = index + 1;
    if (step.sequenceOrder !== newSequenceOrder) {
      stepsToPatch.push({ uuid: step.uuid, sequenceOrder: newSequenceOrder });
    }
    return {
      ...step,
      sequenceOrder: newSequenceOrder,
    };
  });
  col.trip.steps = col.steps.length;

  for (const step of stepsToPatch) {
    try {
      await updateStep(step.uuid, { sequenceOrder: step.sequenceOrder });
    } catch (e) {
      console.error(
        `Erreur lors de la mise à jour de l'ordre de l'étape ${step.uuid}:`,
        e,
      );
    }
  }
}

async function handleStepMove(tripId, stepId, direction) {
  const col = columns.value.find((c) => c.trip.id === tripId);
  if (!col) return;

  const currentIndex = col.steps.findIndex((s) => s.uuid === stepId);
  if (currentIndex === -1) return;

  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= col.steps.length) return;

  const currentStep = col.steps[currentIndex];
  const targetStep = col.steps[targetIndex];
  const currentOrder = currentStep.sequenceOrder;
  const targetOrder = targetStep.sequenceOrder;

  try {
    await Promise.all([
      updateStep(currentStep.uuid, { sequenceOrder: targetOrder }),
      updateStep(targetStep.uuid, { sequenceOrder: currentOrder }),
    ]);

    currentStep.sequenceOrder = targetOrder;
    targetStep.sequenceOrder = currentOrder;

    col.steps.sort((a, b) => a.sequenceOrder - b.sequenceOrder);
  } catch (e) {
    console.error("Erreur lors de l'échange des séquences d'étapes :", e);
  }
}

function handleStepUpdated(tripId, updated) {
  const col = columns.value.find((c) => c.trip.id === tripId);
  if (!col) return;
  const idx = col.steps.findIndex((s) => s.uuid === updated.uuid);
  if (idx !== -1) col.steps.splice(idx, 1, { ...col.steps[idx], ...updated });
}

async function handleCreateStep(tripId) {
  if (creatingStepTripIds.value.has(tripId)) return;

  const col = columns.value.find((c) => c.trip.id === tripId);
  if (!col) return;

  creatingStepTripIds.value.add(tripId);
  try {
    const created = await createStep(tripId);
    col.steps.push(created);
    col.steps.sort((a, b) => a.sequenceOrder - b.sequenceOrder);
    col.trip.steps = col.steps.length;
  } catch (e) {
    console.error("Erreur lors de la création d'une étape :", e);
    alert("Erreur lors de la création de l'étape");
  } finally {
    creatingStepTripIds.value.delete(tripId);
  }
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
const tripsTrackRef = ref(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);
const visibleTripIndexes = ref([]);

const SCROLL_TOLERANCE = 4;

function updateScrollState() {
  const track = tripsTrackRef.value;
  if (!track) return;

  const maxScrollLeft = Math.max(0, track.scrollWidth - track.clientWidth);

  canScrollLeft.value = track.scrollLeft > SCROLL_TOLERANCE;
  canScrollRight.value = track.scrollLeft < maxScrollLeft - SCROLL_TOLERANCE;

  const cards = Array.from(track.querySelectorAll(".trip-column"));
  visibleTripIndexes.value = cards
    .map((card, index) => {
      const left = card.offsetLeft - track.scrollLeft;
      const right = left + card.clientWidth;
      const isVisible = left < track.clientWidth - 1 && right > 1;
      return isVisible ? index : -1;
    })
    .filter((index) => index !== -1);
}

function scrollToAdjacentTrip(direction) {
  const track = tripsTrackRef.value;
  if (!track) return;

  const cards = Array.from(track.querySelectorAll(".trip-column"));
  const cardOffsets = cards.map((card) => card.offsetLeft);
  const current = track.scrollLeft;
  const maxScrollLeft = Math.max(0, track.scrollWidth - track.clientWidth);

  let target = current;
  if (direction === "right") {
    target =
      cardOffsets.find((offset) => offset > current + SCROLL_TOLERANCE) ??
      current + track.clientWidth / 3;
  } else {
    const previousOffsets = cardOffsets.filter(
      (offset) => offset < current - SCROLL_TOLERANCE,
    );
    target =
      previousOffsets[previousOffsets.length - 1] ??
      Math.max(0, current - track.clientWidth / 3);
  }

  target = Math.max(0, Math.min(target, maxScrollLeft));

  track.scrollTo({ left: target, behavior: "smooth" });
}

function scrollToTrip(index) {
  const track = tripsTrackRef.value;
  if (!track) return;

  const cards = Array.from(track.querySelectorAll(".trip-column"));
  const card = cards[index];
  if (!card) return;

  const maxScrollLeft = Math.max(0, track.scrollWidth - track.clientWidth);
  const centeredTarget =
    card.offsetLeft - (track.clientWidth - card.clientWidth) / 2;
  const target = Math.max(0, Math.min(centeredTarget, maxScrollLeft));

  track.scrollTo({ left: target, behavior: "smooth" });
}

const closeDropdown = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    isDropdownOpen.value = false;
  }
};

const onTrackScroll = () => updateScrollState();

watch(
  () => columns.value.length,
  async () => {
    await nextTick();
    updateScrollState();
  },
);

onMounted(() => {
  loadData();
  document.addEventListener("click", closeDropdown);
  window.addEventListener("resize", updateScrollState);

  nextTick(() => {
    updateScrollState();
  });
});

onUnmounted(() => {
  document.removeEventListener("click", closeDropdown);
  window.removeEventListener("resize", updateScrollState);
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
          <button class="btn-new-trip" @click="handleCreateTrip">
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

      <div
        v-if="!loading && !error && columns.length > 0"
        class="trips-indicator"
        aria-label="Indicateur de trajets"
      >
        <button
          v-for="(col, index) in columns"
          :key="`dot-${col.trip.id}`"
          class="indicator-dot"
          :class="{ active: visibleTripIndexes.includes(index) }"
          :aria-label="`Aller au trajet ${index + 1}`"
          @click="scrollToTrip(index)"
        ></button>
      </div>

      <div
        v-if="!loading && !error && columns.length > 0"
        class="trips-carousel-shell"
      >
        <button
          class="scroll-nav left"
          :disabled="!canScrollLeft"
          @click="scrollToAdjacentTrip('left')"
        >
          <ChevronLeft size="20" />
        </button>

        <div
          ref="tripsTrackRef"
          class="trips-grid"
          @scroll.passive="onTrackScroll"
        >
          <div
            v-for="(col, index) in columns"
            :key="col.trip.id"
            class="trip-column"
          >
            <TripCard
              :trip="col.trip"
              :index="index"
              :show-toggle="false"
              :show-delete="true"
              @toggle="(val) => handleToggle(col.trip.id, val)"
              @updated="(patch) => handleTripUpdated(col.trip.id, patch)"
              @deleted="() => handleTripDeleted(col.trip.id)"
            />

            <div class="steps-stack">
              <p v-if="col.steps.length === 0" class="no-steps">
                Aucune étape pour ce trajet.
              </p>
              <StepCard
                v-for="(step, stepIndex) in col.steps"
                :key="step.uuid"
                :step="step"
                :can-move-up="stepIndex > 0"
                :can-move-down="stepIndex < col.steps.length - 1"
                @deleted="(id) => handleStepDeleted(col.trip.id, id)"
                @updated="(upd) => handleStepUpdated(col.trip.id, upd)"
                @move="
                  (direction) =>
                    handleStepMove(col.trip.id, step.uuid, direction)
                "
              />

              <button
                class="btn-add-step"
                :disabled="creatingStepTripIds.has(col.trip.id)"
                @click="handleCreateStep(col.trip.id)"
              >
                <Plus size="15" />
                {{
                  creatingStepTripIds.has(col.trip.id)
                    ? "Ajout..."
                    : "Ajouter une étape"
                }}
              </button>
            </div>
          </div>
        </div>

        <button
          class="scroll-nav right"
          :disabled="!canScrollRight"
          @click="scrollToAdjacentTrip('right')"
        >
          <ChevronRight size="20" />
        </button>
      </div>
    </div>

    <!-- Popup create Trip -->
    <PopupCreateTrip v-model="showNewTripPopup" @submit="handleTripSubmitted" />
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

.trips-carousel-shell {
  --trips-gap: 3rem;
  --edge-offset: 78px;
  --edge-width: 64px;
  --nav-top-offset: 80px;
  position: relative;
}

.trips-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 1.5rem;
  margin-top: -3.5rem;
  /* outline: 1px solid red; */
}

.indicator-dot {
  width: 16px;
  height: 16px;
  border-radius: 999px;
  border: 2px solid #d1d5db;
  background: #e5e7eb;
  cursor: pointer;
  transition: all 0.2s ease;
}

.indicator-dot:hover {
  border-color: var(--primary);
}

.indicator-dot.active {
  border-color: var(--primary);
  background: var(--primary);
}

.edge-fade {
  position: absolute;
  top: 0;
  bottom: 0;
  width: var(--edge-width);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  z-index: 2;
}

.edge-fade.visible {
  opacity: 1;
}

.edge-fade.left {
  left: calc(-1 * var(--edge-offset));
  background: linear-gradient(to right, #f8f9fa 12%, rgba(248, 249, 250, 0));
}

.edge-fade.right {
  right: calc(-1 * var(--edge-offset));
  background: linear-gradient(to left, #f8f9fa 12%, rgba(248, 249, 250, 0));
}

.scroll-nav {
  position: absolute;
  top: var(--nav-top-offset);
  width: 42px;
  height: 42px;
  border: 1.5px solid #dbe3ec;
  border-radius: 999px;
  background-color: white;
  color: #5f6a79;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 3;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
}

.scroll-nav.left {
  left: -60px;
}

.scroll-nav.right {
  right: -60px;
}

.scroll-nav:hover:not(:disabled) {
  border-color: var(--primary);
  color: var(--primary);
}

.scroll-nav:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.trips-grid {
  display: flex;
  flex-direction: row;
  gap: var(--trips-gap);
  padding-top: 10px;
  padding-bottom: 1.5rem;
  align-items: flex-start;
  overflow-x: auto;
  overflow-y: visible;
  scroll-behavior: smooth;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}

.trips-grid::-webkit-scrollbar {
  display: none;
}

.trip-column {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 0 0 calc((100% - (2 * var(--trips-gap))) / 3);
  min-width: 320px;
  scroll-snap-align: start;
}

.steps-stack {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.btn-add-step {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  width: 100%;
  min-height: 38px;
  border-radius: 10px;
  border: 1.5px dashed #cbd5e1;
  background: #f8fafc;
  color: #475569;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.15s ease, background-color 0.15s ease,
    color 0.15s ease;
}

.btn-add-step:hover:not(:disabled) {
  border-color: var(--primary);
  color: var(--primary);
  background: #ffffff;
}

.btn-add-step:disabled {
  opacity: 0.7;
  cursor: wait;
}

.no-steps {
  text-align: center;
  color: #9ca3af;
  font-size: 0.875rem;
  padding: 1rem;
  border: 1px dashed #e5e7eb;
  border-radius: 10px;
}

@media (max-width: 1300px) {
  .trip-column {
    flex-basis: calc((100% - var(--trips-gap)) / 2);
  }
}

@media (max-width: 900px) {
  .scroll-nav,
  .edge-fade {
    display: none;
  }

  .trip-column {
    flex-basis: 100%;
    min-width: 280px;
  }
}
</style>
