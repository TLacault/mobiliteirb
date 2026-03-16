<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from "vue";
import {
  Trash2,
  Leaf,
  Clock3,
  Ruler,
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
  Footprints,
} from "lucide-vue-next";
import { deleteStep, updateStep } from "../../utils/step_api.js";

const props = defineProps({
  step: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["deleted", "updated"]);

const TRANSPORT_MODES = [
  { value: "plane", label: "Avion", icon: Plane },
  { value: "train", label: "Train", icon: TrainFront },
  { value: "car", label: "Voiture", icon: CarFront },
  { value: "bus", label: "Bus", icon: BusFront },
  { value: "carpool", label: "Covoiturage", icon: Users },
  { value: "taxi", label: "Taxi / VTC", icon: CarFront },
  { value: "metro", label: "Métro / Tram", icon: TramFront },
  { value: "ferry", label: "Bateau", icon: Ship },
  { value: "bike", label: "Vélo", icon: Bike },
  { value: "walk", label: "Marche", icon: Footprints },
];

const labelStart = ref(props.step.labelStart ?? "");
const labelEnd = ref(props.step.labelEnd ?? "");
const transportMode = ref(props.step.transportMode ?? "");
const transportMenuOpen = ref(false);
const transportDropdownRef = ref(null);

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

async function selectTransportMode(mode) {
  if (transportMode.value === mode.value) {
    transportMenuOpen.value = false;
    return;
  }

  transportMode.value = mode.value;
  transportMenuOpen.value = false;
  await saveField("transportMode", mode.value);
}

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
      <span class="step-order">Étape {{ step.sequenceOrder }}</span>
      <button
        class="delete-btn"
        title="Supprimer l'étape"
        @click="handleDelete"
      >
        <Trash2 size="15" />
      </button>
    </div>

    <div class="route-block">
      <div class="route-inputs">
        <label class="location-row">
          <span class="location-label">
            <PlaneTakeoff size="16" />
            Départ
          </span>
          <input
            v-model="labelStart"
            type="text"
            placeholder="Lieu de départ"
            class="location-input"
            @blur="saveField('labelStart', labelStart)"
          />
        </label>
        <label class="location-row">
          <span class="location-label">
            <PlaneLanding size="16" />
            Arrivée
          </span>
          <input
            v-model="labelEnd"
            type="text"
            placeholder="Lieu d'arrivée"
            class="location-input"
            @blur="saveField('labelEnd', labelEnd)"
          />
        </label>
      </div>
    </div>

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
        <Clock3 size="13" class="stat-icon" />
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
  </div>
</template>

<style scoped>
.step-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 1rem 1rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
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
  border-radius: 999px;
  transition: color 0.15s, background 0.15s, border-color 0.15s;
}

.delete-btn:hover {
  color: var(--danger);
  border-color: oklch(63.066% 0.194 29.425 / 0.25);
  background: oklch(63.066% 0.194 29.425 / 0.08);
}

/* ── Route inputs ── */
.route-block {
  display: block;
}

.route-inputs {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.location-row {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.location-label {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: #64748b;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.location-label :deep(svg) {
  color: var(--primary);
  flex-shrink: 0;
}

.location-input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 0.7rem 0.85rem;
  font-size: 0.92rem;
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

/* ── Transport dropdown ── */
.transport-dropdown {
  position: relative;
}

.transport-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 0.78rem 0.85rem;
  font-size: 0.92rem;
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
  border-radius: 10px;
  background: transparent;
  color: #334155;
  padding: 0.65rem 0.7rem;
  font-size: 0.9rem;
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

/* ── Stats row ── */
.stats-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  align-items: stretch;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  text-align: center;
  font-size: 0.78rem;
  color: #6b7280;
  padding: 0.7rem 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fbfcfd;
}

.stat-icon {
  flex-shrink: 0;
  color: var(--primary);
}

@media (max-width: 560px) {
  .stats-row {
    grid-template-columns: 1fr;
  }
}
</style>
