<script setup>
import { ref } from "vue";
import { Trash2, Leaf, MapPin, Clock, Ruler } from "lucide-vue-next";
import PopupDelete from "../popup/PopupDelete.vue";
import { deleteStep, updateStep } from "../../utils/step_api.js";

const props = defineProps({
  step: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["deleted", "updated"]);

const TRANSPORT_MODES = [
  { value: "plane", label: "✈️ Avion" },
  { value: "train", label: "🚂 Train" },
  { value: "car", label: "🚗 Voiture" },
  { value: "bus", label: "🚌 Bus" },
  { value: "carpool", label: "🤝 Covoiturage" },
  { value: "taxi", label: "🚕 Taxi / VTC" },
  { value: "metro", label: "🚇 Métro / Tram" },
  { value: "ferry", label: "⛴️ Bateau" },
  { value: "bike", label: "🚲 Vélo" },
  { value: "walk", label: "🚶 Marche" },
];

const labelStart = ref(props.step.labelStart ?? "");
const labelEnd = ref(props.step.labelEnd ?? "");
const transportMode = ref(props.step.transportMode ?? "");
const showDeletePopup = ref(false);

async function saveField(field, value) {
  try {
    const updated = await updateStep(props.step.uuid, { [field]: value });
    emit("updated", updated);
  } catch (e) {
    console.error(`Erreur lors de la mise à jour du step (${field}):`, e);
  }
}

async function handleDelete() {
  try {
    await deleteStep(props.step.uuid);
    emit("deleted", props.step.uuid);
  } catch (e) {
    console.error("Erreur lors de la suppression du step:", e);
  }
}
</script>

<template>
  <div class="step-card">
    <div class="step-top">
      <span class="step-order">Étape {{ step.sequenceOrder }}</span>
      <button
        class="delete-btn"
        title="Supprimer l'étape"
        @click="showDeletePopup = true"
      >
        <Trash2 size="15" />
      </button>
    </div>

    <div class="route-block">
      <div class="route-visual">
        <div class="dot dot-start" />
        <div class="route-line" />
        <div class="dot dot-end" />
      </div>
      <div class="route-inputs">
        <input
          v-model="labelStart"
          type="text"
          placeholder="Départ"
          class="location-input"
          @blur="saveField('labelStart', labelStart)"
        />
        <input
          v-model="labelEnd"
          type="text"
          placeholder="Arrivée"
          class="location-input"
          @blur="saveField('labelEnd', labelEnd)"
        />
      </div>
    </div>

    <select
      v-model="transportMode"
      class="transport-select"
      @change="saveField('transportMode', transportMode)"
    >
      <option value="" disabled>Mode de transport</option>
      <option
        v-for="mode in TRANSPORT_MODES"
        :key="mode.value"
        :value="mode.value"
      >
        {{ mode.label }}
      </option>
    </select>

    <div class="stats-row">
      <div class="stat">
        <Leaf size="13" class="stat-icon" />
        <span
          >{{ step.carbon != null ? step.carbon.toFixed(1) : "—" }} kg CO₂</span
        >
      </div>
      <div class="stat">
        <Ruler size="13" class="stat-icon" />
        <span
          >{{ step.distance != null ? step.distance.toFixed(0) : "—" }} km</span
        >
      </div>
      <div class="stat">
        <Clock size="13" class="stat-icon" />
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

    <PopupDelete
      v-model="showDeletePopup"
      :item-name="`l'étape #${step.sequenceOrder}`"
      @confirm="handleDelete"
    />
  </div>
</template>

<style scoped>
.step-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  box-sizing: border-box;
  transition: box-shadow 0.15s ease;
}

.step-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* ── Top row: order label + delete ── */
.step-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.step-order {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  padding: 0.25rem;
  border-radius: 6px;
  transition:
    color 0.15s,
    background 0.15s;
}

.delete-btn:hover {
  color: var(--danger);
  background: oklch(63.066% 0.194 29.425 / 0.08);
}

/* ── Route visual + inputs ── */
.route-block {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.route-visual {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--accent);
  flex-shrink: 0;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: white;
  border: 3px solid currentColor;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.route-line {
  width: 3px;
  height: 28px;
  background: currentColor;
  margin: -2px 0;
  border-radius: 2px;
  opacity: 0.5;
}

.route-inputs {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
}

.location-input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.4rem 0.65rem;
  font-size: 0.875rem;
  font-family: var(--font-inter);
  color: var(--text);
  background: #f9fafb;
  outline: none;
  transition:
    border-color 0.15s,
    background 0.15s;
}

.location-input:focus {
  border-color: var(--primary);
  background: #ffffff;
}

.location-input::placeholder {
  color: #9ca3af;
}

/* ── Transport mode select ── */
.transport-select {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.4rem 0.65rem;
  font-size: 0.875rem;
  font-family: var(--font-inter);
  color: var(--text);
  background: #f9fafb;
  outline: none;
  cursor: pointer;
  transition:
    border-color 0.15s,
    background 0.15s;
  appearance: auto;
}

.transport-select:focus {
  border-color: var(--primary);
  background: #ffffff;
}

/* ── Stats row ── */
.stats-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.78rem;
  color: #6b7280;
  white-space: nowrap;
}

.stat-icon {
  flex-shrink: 0;
  color: var(--primary);
}
</style>
