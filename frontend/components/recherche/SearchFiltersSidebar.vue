<script setup>
import { ref, computed } from "vue";
import {
  Filter,
  Route,
  BusFront,
  TrainFront,
  CarFront,
  Plane,
  Bike,
  Footprints,
  Users,
  Clock3,
  Search,
  Leaf,
  ListOrdered,
  Ruler,
  CheckCheck,
  MapPin,
  ArrowUpDown,
} from "lucide-vue-next";

const emit = defineEmits(["search"]);

const departure = ref("");
const arrival = ref("");

const transportOptions = [
  { value: "plane", label: "Avion", icon: Plane },
  { value: "train", label: "Train", icon: TrainFront },
  { value: "car", label: "Voiture", icon: CarFront },
  { value: "bus", label: "Bus", icon: BusFront },
  { value: "carpool", label: "Covoiturage", icon: Users },
  { value: "bike", label: "Velo", icon: Bike },
  { value: "walk", label: "Marche", icon: Footprints },
];

const selectedTransportModes = ref(
  transportOptions.map((option) => option.value),
);

const emissionsMin = ref(0);
const emissionsMax = ref(12);

const durationMin = ref(15);
const durationMax = ref(240);

const distanceMin = ref(5);
const distanceMax = ref(400);

const stepsMin = ref(1);
const stepsMax = ref(5);

const allTransportModesSelected = computed(
  () => selectedTransportModes.value.length === transportOptions.length,
);

const formattedDurationMin = computed(() => formatMinutes(durationMin.value));
const formattedDurationMax = computed(() => formatMinutes(durationMax.value));

function formatMinutes(totalMinutes) {
  const minutes = Number(totalMinutes ?? 0);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours <= 0) return `${mins} min`;
  if (mins === 0) return `${hours} h`;
  return `${hours} h ${mins} min`;
}

function rangeTrackStyle(minValue, maxValue, domainMin, domainMax) {
  const span = domainMax - domainMin;
  if (span <= 0) return { "--start": "0%", "--end": "100%" };

  const start = ((minValue - domainMin) / span) * 100;
  const end = ((maxValue - domainMin) / span) * 100;

  return {
    "--start": `${Math.max(0, Math.min(100, start))}%`,
    "--end": `${Math.max(0, Math.min(100, end))}%`,
  };
}

function makeRangePair(minRef, maxRef) {
  return [
    (e) => {
      const v = Math.min(+e.target.value, maxRef.value);
      minRef.value = v;
      e.target.value = v;
    },
    (e) => {
      const v = Math.max(+e.target.value, minRef.value);
      maxRef.value = v;
      e.target.value = v;
    },
  ];
}

const [onEmissionsMinInput, onEmissionsMaxInput] = makeRangePair(
  emissionsMin,
  emissionsMax,
);
const [onDurationMinInput, onDurationMaxInput] = makeRangePair(
  durationMin,
  durationMax,
);
const [onDistanceMinInput, onDistanceMaxInput] = makeRangePair(
  distanceMin,
  distanceMax,
);
const [onStepsMinInput, onStepsMaxInput] = makeRangePair(stepsMin, stepsMax);

function swapLocations() {
  const previousDeparture = departure.value;
  departure.value = arrival.value;
  arrival.value = previousDeparture;
}

function toggleTransportMode(mode) {
  const isSelected = selectedTransportModes.value.includes(mode);
  if (isSelected) {
    selectedTransportModes.value = selectedTransportModes.value.filter(
      (value) => value !== mode,
    );
    return;
  }

  selectedTransportModes.value = [...selectedTransportModes.value, mode];
}

function selectAllTransportModes() {
  selectedTransportModes.value = transportOptions.map((option) => option.value);
}

function unselectAllTransportModes() {
  selectedTransportModes.value = [];
}

function toggleAllTransportModes() {
  if (allTransportModesSelected.value) {
    unselectAllTransportModes();
    return;
  }
  selectAllTransportModes();
}

function triggerSearch() {
  emit("search", {
    departure: departure.value,
    arrival: arrival.value,
    transportModes: selectedTransportModes.value,
    emissions: { min: emissionsMin.value, max: emissionsMax.value },
    duration: { min: durationMin.value, max: durationMax.value },
    distance: { min: distanceMin.value, max: distanceMax.value },
    steps: { min: stepsMin.value, max: stepsMax.value },
  });
}
</script>

<template>
  <aside class="filters-wrapper">
    <div class="filters-header">
      <Filter class="section-icon" size="32" />
      <h2 class="section-title gradient-cta">Filtres</h2>
    </div>

    <div class="filters-section">
      <div class="filters-content">
        <section class="filter-group">
          <div class="filter-group-header">
            <MapPin size="16" />
            <h3>Lieux</h3>
            <button
              type="button"
              class="all-transport-btn"
              @click="swapLocations"
            >
              <ArrowUpDown size="14" />
              <span>Inverser</span>
            </button>
          </div>
          <div class="places-fields">
            <label class="field-wrapper">
              <input
                v-model="departure"
                type="text"
                placeholder="Ville de depart"
                class="filter-input"
              />
            </label>

            <label class="field-wrapper">
              <input
                v-model="arrival"
                type="text"
                placeholder="Ville d'arrivee"
                class="filter-input"
              />
            </label>
          </div>
        </section>

        <section class="filter-group">
          <div class="filter-group-header">
            <Route size="16" />
            <h3>Modes de transport</h3>
            <button
              type="button"
              class="all-transport-btn"
              :class="{ active: allTransportModesSelected }"
              @click="toggleAllTransportModes"
            >
              <CheckCheck size="14" />
              <span>Tous</span>
            </button>
          </div>

          <div class="transport-grid">
            <button
              v-for="mode in transportOptions"
              :key="mode.value"
              type="button"
              class="transport-mode-btn"
              :class="{ active: selectedTransportModes.includes(mode.value) }"
              @click="toggleTransportMode(mode.value)"
            >
              <component :is="mode.icon" size="16" />
              <span>{{ mode.label }}</span>
            </button>
          </div>
        </section>

        <section class="filter-group">
          <div class="filter-group-header">
            <Leaf size="16" />
            <h3>Emissions (kg CO2)</h3>
          </div>
          <div class="range-row">
            <div class="range-values-inline">
              <span>
                Min: <strong>{{ emissionsMin }} kg CO2</strong>
              </span>
              <span>
                Max: <strong>{{ emissionsMax }} kg CO2</strong>
              </span>
            </div>
            <div
              class="dual-range"
              :style="rangeTrackStyle(emissionsMin, emissionsMax, 0, 40)"
            >
              <input
                :value="emissionsMin"
                type="range"
                min="0"
                max="40"
                step="1"
                @input="onEmissionsMinInput"
              />
              <input
                :value="emissionsMax"
                type="range"
                min="0"
                max="40"
                step="1"
                @input="onEmissionsMaxInput"
              />
            </div>
          </div>
        </section>

        <section class="filter-group">
          <div class="filter-group-header">
            <Clock3 size="16" />
            <h3>Temps de trajet</h3>
          </div>
          <div class="range-row">
            <div class="range-values-inline">
              <span>
                Min: <strong>{{ formattedDurationMin }}</strong>
              </span>
              <span>
                Max: <strong>{{ formattedDurationMax }}</strong>
              </span>
            </div>
            <div
              class="dual-range"
              :style="rangeTrackStyle(durationMin, durationMax, 15, 900)"
            >
              <input
                :value="durationMin"
                type="range"
                min="15"
                max="900"
                step="15"
                @input="onDurationMinInput"
              />
              <input
                :value="durationMax"
                type="range"
                min="15"
                max="900"
                step="15"
                @input="onDurationMaxInput"
              />
            </div>
          </div>
        </section>

        <section class="filter-group">
          <div class="filter-group-header">
            <Ruler size="16" />
            <h3>Distance (km)</h3>
          </div>
          <div class="range-row">
            <div class="range-values-inline">
              <span>
                Min: <strong>{{ distanceMin }} km</strong>
              </span>
              <span>
                Max: <strong>{{ distanceMax }} km</strong>
              </span>
            </div>
            <div
              class="dual-range"
              :style="rangeTrackStyle(distanceMin, distanceMax, 5, 2000)"
            >
              <input
                :value="distanceMin"
                type="range"
                min="5"
                max="2000"
                step="5"
                @input="onDistanceMinInput"
              />
              <input
                :value="distanceMax"
                type="range"
                min="5"
                max="2000"
                step="5"
                @input="onDistanceMaxInput"
              />
            </div>
          </div>
        </section>

        <section class="filter-group">
          <div class="filter-group-header">
            <ListOrdered size="16" />
            <h3>Nombre d'etapes</h3>
          </div>
          <div class="range-row">
            <div class="range-values-inline">
              <span>
                Min:
                <strong
                  >{{ stepsMin }} etape{{ stepsMin > 1 ? "s" : "" }}</strong
                >
              </span>
              <span>
                Max:
                <strong
                  >{{ stepsMax }} etape{{ stepsMax > 1 ? "s" : "" }}</strong
                >
              </span>
            </div>
            <div
              class="dual-range"
              :style="rangeTrackStyle(stepsMin, stepsMax, 1, 12)"
            >
              <input
                :value="stepsMin"
                type="range"
                min="1"
                max="12"
                step="1"
                @input="onStepsMinInput"
              />
              <input
                :value="stepsMax"
                type="range"
                min="1"
                max="12"
                step="1"
                @input="onStepsMaxInput"
              />
            </div>
          </div>
        </section>
      </div>
    </div>

    <div class="filters-actions">
      <button type="button" class="search-btn" @click="triggerSearch">
        <Search size="16" />
        <span>Rechercher</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.filters-wrapper {
  display: flex;
  flex-direction: column;
  position: sticky;
  top: calc(73px + 1.75rem);
  height: calc(100vh - 73px - 3.5rem);
  gap: 0.65rem;
}

.filters-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.filters-section {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  padding: 1rem;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: oklch(70.62% 0.139 158.37 / 30%) transparent;
}

.filters-section::-webkit-scrollbar {
  width: 4px;
}

.filters-section::-webkit-scrollbar-track {
  background: transparent;
}

.filters-section::-webkit-scrollbar-thumb {
  background: oklch(99.393% 0.00832 169.522 / 0.3);
  border-radius: 999px;
}

.filters-section::-webkit-scrollbar-thumb:hover {
  background: oklch(77.386% 0.01667 166.875 / 0.6);
}

.section-icon {
  color: var(--primary);
  flex-shrink: 0;
}

.section-title {
  margin: 0;
}

.filters-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.filter-group {
  display: grid;
  gap: 0.3rem;
}

.filter-group-header {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  color: #334155;
}

.filter-group-header h3 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
}

.places-fields {
  display: grid;
  gap: 0.5rem;
}

.field-wrapper {
  display: grid;
  gap: 0.35rem;
}

.field-label {
  color: #475569;
  font-size: 0.75rem;
  font-weight: 600;
}

.filter-input {
  width: 100%;
  min-height: 35px;
  border: 1.5px solid #dbe3ec;
  border-radius: 10px;
  background: #fff;
  color: var(--text);
  font-size: 0.88rem;
  padding: 0.38rem 0.6rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.filter-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px oklch(70.62% 0.139 158.37 / 10%);
}

.swap-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  min-height: 32px;
  border-radius: 999px;
  border: 1.5px dashed #cbd5e1;
  background: #f8fafc;
  color: #475569;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.swap-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: #ffffff;
}

.all-transport-btn {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  min-height: 26px;
  padding: 0 0.55rem;
  border-radius: 999px;
  border: 1.5px solid #dbe3ec;
  background: #f8fbff;
  color: #475569;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.all-transport-btn:hover {
  border-color: #22c55e;
  background: #f0fdf4;
}

.all-transport-btn.active {
  border-color: #16a34a;
  background: #f0fdf4;
  color: #16a34a;
}

.transport-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.45rem;
}

.transport-mode-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 34px;
  padding: 0 0.55rem;
  border-radius: 9px;
  border: 1.5px solid #dbe3ec;
  background: #ffffff;
  color: #475569;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.transport-mode-btn:hover {
  border-color: var(--primary);
}

.transport-mode-btn.active {
  border-color: var(--primary);
  background: oklch(70.62% 0.139 158.37 / 10%);
  color: var(--primary);
}

.range-row {
  display: grid;
  gap: 0.2rem;
}

.range-values-inline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  color: #475569;
  font-size: 0.75rem;
}

.dual-range {
  position: relative;
  height: 24px;
  --start: 0%;
  --end: 100%;
}

.dual-range::before {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 8px;
  border-radius: 999px;
  background: linear-gradient(
    to right,
    #e1e1e1 0 var(--start),
    var(--primary) var(--start) var(--end),
    #e1e1e1 var(--end) 100%
  );
}

.dual-range input[type="range"] {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  height: 24px;
  margin: 0;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  pointer-events: none;
}

.dual-range input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid var(--primary);
  background: #ffffff;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.18);
  pointer-events: auto;
  cursor: pointer;
  margin-top: -4px;
  transition: all 0.2s ease;
}

.dual-range input[type="range"]::-webkit-slider-thumb:hover {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.2);
}

.dual-range input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid var(--primary);
  background: #ffffff;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.18);
  pointer-events: auto;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dual-range input[type="range"]::-moz-range-thumb:hover {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.2);
}

.dual-range input[type="range"]::-webkit-slider-runnable-track {
  height: 8px;
  background: transparent;
}

.dual-range input[type="range"]::-moz-range-track {
  height: 8px;
  background: transparent;
}

.filters-actions {
  flex-shrink: 0;
}

.search-btn {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 40px;
  border: none;
  border-radius: 11px;
  background: var(--gradientCallToAction);
  color: #fff;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
}

.search-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px oklch(70.62% 0.139 158.37 / 25%);
  filter: brightness(1.02);
}

@media (max-width: 1024px) {
  .filters-wrapper {
    position: static;
    top: auto;
    height: auto;
  }

  .filters-section {
    overflow: visible;
  }

  .filters-actions {
    flex-shrink: 0;
  }
}
</style>
