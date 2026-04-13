<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from "vue";
import {
  Trash2,
  Leaf,
  Clock3,
  Ruler,
  ChevronUp,
  ChevronDown,
  Check,
  PlaneTakeoff,
  PlaneLanding,
  Plane,
  TrainFront,
  CarFront,
  BusFront,
  Users,
  TramFront,
  Ship,
  Bike,
  Motorbike,
  Footprints,
  NotebookPen,
  CheckCheck,
} from "lucide-vue-next";
import { deleteStep, updateStep } from "../../utils/step_api.js";
import {
  formatPlaceSuggestion,
  usePlaceAutocomplete,
} from "../../utils/place";

const props = defineProps({
  step: {
    type: Object,
    required: true,
  },
  canMoveUp: {
    type: Boolean,
    default: false,
  },
  canMoveDown: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["deleted", "updated", "move"]);
const stepId = computed(() => props.step?.id ?? props.step?.uuid);

const TRANSPORT_MODES = [
  { value: "plane", label: "Avion", icon: Plane },
  { value: "train_high_speed", label: "TGV", icon: TrainFront },
  { value: "train_intercity", label: "Intercités", icon: TrainFront },
  { value: "car_gasoline", label: "Voiture (Essence)", icon: CarFront },
  { value: "car_electric", label: "Voiture (Electrique)", icon: CarFront },
  { value: "bus_gasoline_long_haul", label: "Autocar", icon: BusFront },
  { value: "bike", label: "Vélo", icon: Bike },
  { value: "bike_electric", label: "Vélo (Electrique)", icon: Bike },
  { value: "bus_gasoline", label: "Bus de ville (Essence)", icon: BusFront },
  { value: "tram", label: "Tram", icon: TramFront },
  { value: "metro", label: "Métro", icon: TramFront },
  { value: "scooter_gasoline", label: "Scooter (Essence)", icon: Motorbike },
  { value: "motorcycle_gasoline", label: "Moto (Essence)", icon: Motorbike },
  { value: "train_paris", label: "RER", icon: TrainFront },
  { value: "train_regional", label: "TER", icon: TrainFront },  
  { value: "bus_electric", label: "Bus de ville (Electrique)", icon: BusFront },
  { value: "car_gasoline_1_passenger", label: "Voiture essence (1 personne))", icon: CarFront },
  { value: "car_gasoline_2_passengers", label: "Voiture essence (2 personnes)", icon: CarFront },
  { value: "car_gasoline_3_passengers", label: "Voiture essence (3 personnes)", icon: CarFront },
  { value: "car_gasoline_4_passengers", label: "Voiture essence (4 personnes)", icon: CarFront },
  { value: "car_electric_1_passenger", label: "Voiture électrique (1 personne))", icon: CarFront },
  { value: "car_electric_2_passengers", label: "Voiture electrique (2 personnes)", icon: CarFront },
  { value: "car_electric_3_passengers", label: "Voiture electrique (3 personnes)", icon: CarFront },
  { value: "car_electric_4_passengers", label: "Voiture electrique (4 personnes)", icon: CarFront },
  { value: "walk", label: "Marche", icon: Footprints },
];

const labelStart = ref(props.step.labelStart ?? "");
const labelEnd = ref(props.step.labelEnd ?? "");
const transportMode = ref(props.step.transportMode ?? "");
const transportMenuOpen = ref(false);
const transportDropdownRef = ref(null);

// Notes management
const showNotes = ref(false);
const localNotes = ref(props.step.metadata?.notes ?? "");
const committedNotes = ref(props.step.metadata?.notes ?? "");
const savedNotes = ref(false);
let notessavedTimer = null;
const debounceTimers = {};

watch(
  () => props.step.labelStart,
  (value) => {
    labelStart.value = value ?? "";
  },
);

watch(
  () => props.step.labelEnd,
  (value) => {
    labelEnd.value = value ?? "";
  },
);

watch(
  () => props.step.transportMode,
  (value) => {
    transportMode.value = value ?? "";
  },
);

watch(
  () => props.step.metadata?.notes,
  (value) => {
    localNotes.value = value ?? "";
    committedNotes.value = value ?? "";
  },
);

const selectedTransport = computed(
  () =>
    TRANSPORT_MODES.find((mode) => mode.value === transportMode.value) ?? {
      value: "",
      label: "Mode de transport",
      icon: Plane,
    },
);

async function saveField(field, value) {
  try {
    const updated = await updateStep(stepId.value, { [field]: value });
    emit("updated", updated);
  } catch (e) {
    console.error(`Error updating step (${field}):`, e);
    const details = e.response?.data?.details || e.response?.data?.error || e.data?.details || e.data?.error;
    const defaultMessage = "Impossible de calculer l'itinéraire";
    const errorMessage = details || defaultMessage;
    alert(`Erreur : ${errorMessage}`);
  }
}

async function handleDelete() {
  try {
    await deleteStep(stepId.value);
    emit("deleted", stepId.value);
  } catch (e) {
    console.error("Erreur lors de la suppression du step:", e);
  }
}

async function selectTransportMode(mode) {
  if (transportMode.value === mode.value) {
    transportMenuOpen.value = false;
    return;
  }

  transportMode.value = mode.value;
  transportMenuOpen.value = false;
  await saveField("transportMode", mode.value);
}

function handleLabelStartBlur() {
  labelStartAutocomplete.handleBlur();
  saveField("labelStart", labelStart.value);
}

function handleLabelEndBlur() {
  labelEndAutocomplete.handleBlur();
  saveField("labelEnd", labelEnd.value);
}

const labelStartAutocomplete = usePlaceAutocomplete();
const labelEndAutocomplete = usePlaceAutocomplete();
const labelStartSuggestions = labelStartAutocomplete.suggestions;
const labelStartSuggestionsNotEmpty = labelStartAutocomplete.suggestionsNotEmpty;
const labelEndSuggestions = labelEndAutocomplete.suggestions;
const labelEndSuggestionsNotEmpty = labelEndAutocomplete.suggestionsNotEmpty;

function selectLabelStartSuggestion(suggestion) {
  labelStart.value = formatPlaceSuggestion(suggestion);
  labelStartAutocomplete.close();
}

function selectLabelEndSuggestion(suggestion) {
  labelEnd.value = formatPlaceSuggestion(suggestion);
  labelEndAutocomplete.close();
}

const isDirtyNotes = () => {
  return localNotes.value.trim() !== committedNotes.value.trim();
};

const flashSavedNotes = () => {
  savedNotes.value = true;
  clearTimeout(notessavedTimer);
  notessavedTimer = setTimeout(() => {
    savedNotes.value = false;
  }, 2000);
};

const saveNotes = async () => {
  clearTimeout(debounceTimers.notes);
  localNotes.value = localNotes.value.trim();
  if (!isDirtyNotes()) return;

  try {
    const metadata = {
      ...props.step.metadata,
      notes: localNotes.value,
    };
    const updated = await updateStep(stepId.value, { metadata });
    committedNotes.value = localNotes.value;
    emit("updated", updated);
    flashSavedNotes();
  } catch (e) {
    console.error("Erreur lors de la mise à jour des notes:", e);
  }
};

const scheduleSaveNotes = () => {
  clearTimeout(debounceTimers.notes);
  debounceTimers.notes = setTimeout(() => saveNotes(), 1000);
};

function closeTransportMenu(event) {
  if (
    transportDropdownRef.value &&
    !transportDropdownRef.value.contains(event.target)
  ) {
    transportMenuOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", closeTransportMenu);
});

onUnmounted(() => {
  document.removeEventListener("click", closeTransportMenu);
});
</script>

<template>
  <div class="step-card">
    <div class="step-top">
      <div class="step-top-left">
        <div class="reorder-control" aria-label="Réordonner l'étape">
          <button
            class="reorder-btn"
            type="button"
            title="Monter l'étape"
            :disabled="!canMoveUp"
            @click.stop="emit('move', 'up')"
          >
            <ChevronUp size="12" />
          </button>
          <button
            class="reorder-btn"
            type="button"
            title="Descendre l'étape"
            :disabled="!canMoveDown"
            @click.stop="emit('move', 'down')"
          >
            <ChevronDown size="12" />
          </button>
        </div>
        <span class="step-order">Étape {{ step.sequenceOrder }}</span>
      </div>

      <div class="step-top-right">
        <div class="top-stats-row">
          <div class="top-stat-badge">
            <Leaf size="12" class="stat-icon" />
            <span
              >{{ step.carbon != null ? step.carbon.toFixed(1) : "—" }} kg
              CO₂</span
            >
          </div>
          <div class="top-stat-badge">
            <Ruler size="12" class="stat-icon" />
            <span
              >{{
                step.distance != null ? step.distance.toFixed(0) : "—"
              }}
              km</span
            >
          </div>
          <div class="top-stat-badge">
            <Clock3 size="12" class="stat-icon" />
            <span>
              <template v-if="step.time != null">
                <template v-if="Math.floor(step.time / 60) > 0">
                  {{ Math.floor(step.time / 60) }}h
                </template>
                {{ (step.time % 60).toFixed(0) }}min
              </template>
              <template v-else> — </template>
            </span>
          </div>
        </div>

        <button
          class="delete-btn"
          title="Supprimer l'étape"
          @click="handleDelete"
        >
          <Trash2 size="15" />
        </button>
      </div>
    </div>

    <div class="route-block">
      <div class="route-inputs">
        <label class="location-row">
          <span class="location-label">
            <PlaneTakeoff size="16" />
            Départ
          </span>
          <div class="location-input-wrapper">
            <input
              v-model="labelStart"
              type="text"
              class="location-input"
              @input="(e) => labelStartAutocomplete.handleInput(e.target.value)"
              @focus="labelStartAutocomplete.handleFocus"
              @blur="handleLabelStartBlur"
            />

            <ul
              v-if="labelStartSuggestionsNotEmpty && labelStartSuggestions.length"
              class="autocomplete-dropdown"
            >
              <li
                v-for="s in labelStartSuggestions"
                :key="`${s.cityName}-${s.countryName}`"
                class="autocomplete-item"
                  @mousedown.prevent="selectLabelStartSuggestion(s)"
              >
                {{ s.cityName }}, {{ s.countryName }}
              </li>
            </ul>
          </div>
        </label>
        <label class="location-row">
          <span class="location-label">
            <PlaneLanding size="16" />
            Arrivée
          </span>
          <div class="location-input-wrapper">
            <input
              v-model="labelEnd"
              type="text"
              class="location-input"
              @input="(e) => labelEndAutocomplete.handleInput(e.target.value)"
              @focus="labelEndAutocomplete.handleFocus"
              @blur="handleLabelEndBlur"
            />

            <ul
              v-if="labelEndSuggestionsNotEmpty && labelEndSuggestions.length"
              class="autocomplete-dropdown"
            >
              <li
                v-for="s in labelEndSuggestions"
                :key="`${s.cityName}-${s.countryName}`"
                class="autocomplete-item"
                  @mousedown.prevent="selectLabelEndSuggestion(s)"
              >
                {{ s.cityName }}, {{ s.countryName }}
              </li>
            </ul>
          </div>
        </label>

        <label class="location-row transport-row">
          <span class="location-label">
            <Plane size="16" />
            Transport
          </span>

          <div ref="transportDropdownRef" class="transport-dropdown">
            <button
              class="transport-trigger"
              @click.stop="transportMenuOpen = !transportMenuOpen"
            >
              <span class="transport-trigger-main">
                <component :is="selectedTransport.icon" size="16" />
                <span>{{ selectedTransport.label }}</span>
              </span>
              <ChevronDown
                size="15"
                class="trigger-chevron"
                :class="{ open: transportMenuOpen }"
              />
            </button>

            <Transition name="transport-menu">
              <div v-if="transportMenuOpen" class="transport-menu">
                <button
                  v-for="mode in TRANSPORT_MODES"
                  :key="mode.value"
                  class="transport-option"
                  :class="{ active: transportMode === mode.value }"
                  @click="selectTransportMode(mode)"
                >
                  <span class="transport-option-main">
                    <component :is="mode.icon" size="16" />
                    <span>{{ mode.label }}</span>
                  </span>
                  <Check v-if="transportMode === mode.value" size="14" />
                </button>
              </div>
            </Transition>
          </div>
        </label>
      </div>
    </div>

    <div class="notes-section">
      <button
        class="notes-toggle"
        @click="showNotes = !showNotes"
        :title="showNotes ? 'Masquer les notes' : 'Afficher les notes'"
      >
        <NotebookPen size="14" />
        <span>Notes</span>
        <ChevronDown
          size="14"
          class="notes-chevron"
          :class="{ open: showNotes }"
        />
      </button>

      <Transition name="notes-expand">
        <div v-if="showNotes" class="notes-content">
          <div class="notes-input-wrapper">
            <textarea
              v-model="localNotes"
              placeholder="Ajouter des notes sur cette étape..."
              class="notes-textarea"
              @input="scheduleSaveNotes"
              @blur="saveNotes"
            ></textarea>
            <Transition name="badge">
              <span v-if="savedNotes" class="saved-badge notes-badge">
                <CheckCheck size="13" />
                saved
              </span>
            </Transition>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.step-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 0.75rem 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  width: 100%;
  box-sizing: border-box;
  transition: box-shadow 0.15s ease, border-color 0.15s ease;
}

.step-card:hover {
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
  border-color: #d4dee9;
}

/* ── Top row: order label + delete ── */
.step-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.6rem;
}

.step-top-left {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.step-top-right {
  margin-left: auto;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.35rem;
}

.reorder-control {
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f8fafc;
  overflow: hidden;
}

.reorder-btn {
  width: 100%;
  height: 50%;
  border: none;
  background: transparent;
  padding: 0;
  color: #94a3b8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.reorder-btn:hover:not(:disabled) {
  background: #eef2f7;
  color: var(--primary);
}

.reorder-btn:disabled {
  color: #cbd5e1;
  cursor: not-allowed;
}

.step-order {
  font-size: 0.8rem;
  font-weight: 650;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-left: 0.25rem;
}

.delete-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #fff;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  color: #9ca3af;
  padding: 0;
  margin-left: 0.5rem;
  border-radius: 999px;
  transition: color 0.15s, background 0.15s, border-color 0.15s;
}

.delete-btn:hover {
  color: var(--danger);
  border-color: oklch(63.066% 0.194 29.425 / 0.25);
  background: oklch(63.066% 0.194 29.425 / 0.08);
}

.top-stats-row {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  flex-wrap: nowrap;
  justify-content: flex-start;
}

.top-stat-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  height: 32px;
  padding: 0 0.5rem;
  border-radius: 999px;
  /* border: 1px solid #e5e7eb; */
  /* background: #f4f5f6; */
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
}

/* ── Route inputs ── */
.route-block {
  display: block;
}

.route-inputs {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.location-row {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  align-items: center;
  gap: 0.45rem;
}

.location-input-wrapper {
  position: relative;
  width: 95%;
  margin-left: 5%;
}

.location-label {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  width: 88px;
  flex-shrink: 0;
}

.location-label :deep(svg) {
  color: var(--primary);
  flex-shrink: 0;
}

.location-input {
  width: 95%;
  margin-left: 0;
  box-sizing: border-box;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 0.42rem 0.6rem;
  font-size: 0.82rem;
  font-family: var(--font-inter);
  color: var(--text);
  background: #f8fafc;
  outline: none;
  transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
}

.location-input:focus {
  border-color: var(--primary);
  background: #ffffff;
  box-shadow: 0 0 0 3px oklch(70.62% 0.139 158.37 / 0.1);
}

.location-input::placeholder {
  color: #9ca3af;
}

.autocomplete-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 30;
  margin: 0;
  padding: 0.35rem 0;
  list-style: none;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
  max-height: 220px;
  overflow-y: auto;
}

.autocomplete-item {
  padding: 0.55rem 0.7rem;
  cursor: pointer;
  font-size: 0.84rem;
  color: #0f172a;
}

.autocomplete-item:hover {
  background: #f8fafc;
}

.transport-row {
  align-items: stretch;
}

/* ── Transport dropdown ── */
.transport-dropdown {
  position: relative;
  width: 95%;
  margin-left: 5%;
  min-width: 0;
  max-width: 100%;
}

.transport-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 0.42rem 0.6rem;
  font-size: 0.82rem;
  font-family: var(--font-inter);
  color: var(--text);
  background: #f8fafc;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
}

.transport-trigger:hover,
.transport-trigger:focus {
  border-color: var(--primary);
  background: #ffffff;
  box-shadow: 0 0 0 3px oklch(70.62% 0.139 158.37 / 0.1);
  outline: none;
}

.transport-trigger-main,
.transport-option-main {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
}

.transport-trigger-main :deep(svg),
.transport-option-main :deep(svg) {
  color: var(--primary);
  flex-shrink: 0;
}

.trigger-chevron {
  color: #94a3b8;
  transition: transform 0.2s ease;
}

.trigger-chevron.open {
  transform: rotate(180deg);
}

.transport-menu {
  position: absolute;
  top: calc(100% + 0.45rem);
  left: 0;
  right: 0;
  padding: 0.35rem;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.12);
  z-index: 20;
}

.transport-option {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #334155;
  padding: 0.5rem 0.58rem;
  font-size: 0.84rem;
  font-family: var(--font-inter);
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.transport-option:hover {
  background: #f8fafc;
}

.transport-option.active {
  background: oklch(70.62% 0.139 158.37 / 0.08);
  color: var(--primary);
  font-weight: 600;
}

.transport-option.active :deep(svg:last-child) {
  color: var(--primary);
}

.transport-menu-enter-active,
.transport-menu-leave-active {
  transition: opacity 0.16s ease, transform 0.16s ease;
}

.transport-menu-enter-from,
.transport-menu-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.stat-icon {
  flex-shrink: 0;
  color: var(--primary);
}

@media (max-width: 900px) {
  .step-top {
    flex-direction: column;
    align-items: stretch;
  }

  .step-top-right {
    margin-left: 0;
    align-items: center;
    flex-wrap: wrap;
  }

  .top-stats-row {
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .location-row {
    grid-template-columns: 1fr;
    align-items: flex-start;
  }

  .location-label {
    width: auto;
  }
}

/* ── Notes section ── */
.notes-section {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  border-top: 1px solid #e5e7eb;
  padding-top: 0.6rem;
}

.notes-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0;
  font-size: 0.82rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  transition: color 0.15s ease;
}

.notes-toggle:hover {
  color: var(--primary);
}

.notes-toggle :deep(svg) {
  color: var(--primary);
  flex-shrink: 0;
}

.notes-chevron {
  margin-left: auto;
  transition: transform 0.2s ease;
  color: #94a3b8;
}

.notes-chevron.open {
  transform: rotate(180deg);
}

.notes-content {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  overflow: hidden;
  transform-origin: top;
}

.notes-input-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
}

.notes-textarea {
  width: 100%;
  min-height: 100px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 0.6rem;
  font-size: 0.82rem;
  font-family: var(--font-inter);
  color: var(--text);
  background: #f8fafc;
  outline: none;
  resize: vertical;
  transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
}

.notes-textarea:focus {
  border-color: var(--primary);
  background: #ffffff;
  box-shadow: 0 0 0 3px oklch(70.62% 0.139 158.37 / 0.1);
}

.notes-textarea::placeholder {
  color: #9ca3af;
}

.saved-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--primary);
  background: #dcfce7;
  padding: 0.2rem 0.55rem;
  border-radius: 100px;
  white-space: nowrap;
  pointer-events: none;
  border: 1.5px solid var(--primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.notes-badge {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
}

.notes-expand-enter-active,
.notes-expand-leave-active {
  overflow: hidden;
  transition: max-height 0.32s ease-in-out, opacity 0.24s ease-in-out,
    transform 0.32s ease-in-out;
}

.notes-expand-enter-from,
.notes-expand-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-6px) scaleY(0.96);
}

.notes-expand-enter-to,
.notes-expand-leave-from {
  opacity: 1;
  max-height: 180px;
  transform: translateY(0) scaleY(1);
}

.badge-enter-active,
.badge-leave-active {
  transition: opacity 0.3s ease;
}

.badge-enter-from,
.badge-leave-to {
  opacity: 0;
}
</style>
