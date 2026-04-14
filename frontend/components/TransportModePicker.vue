<script setup>
import { ref, computed } from "vue";
import {
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
  Check,
  CheckCheck,
  ChevronDown,
  X,
} from "lucide-vue-next";

const props = defineProps({
  /** single mode: v-model is a string */
  modelValue: { type: [String, Array], default: "" },
  /** false = single select (StepCard), true = multi select (filters) */
  multiple: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "select"]);

const open = ref(false);

/* ── Transport catalogue grouped into 3 sections ── */

const sections = [
  {
    title: "Véhicules personnels",
    modes: [
      {
        value: "car_gasoline",
        label: "Voiture",
        detail: "Essence",
        icon: CarFront,
      },
      {
        value: "car_electric",
        label: "Voiture",
        detail: "Électrique",
        icon: CarFront,
      },
      {
        value: "car_gasoline_1_passenger",
        label: "Voiture",
        detail: "Essence · 1 pers.",
        icon: CarFront,
      },
      {
        value: "car_gasoline_2_passengers",
        label: "Voiture",
        detail: "Essence · 2 pers.",
        icon: CarFront,
      },
      {
        value: "car_gasoline_3_passengers",
        label: "Voiture",
        detail: "Essence · 3 pers.",
        icon: CarFront,
      },
      {
        value: "car_gasoline_4_passengers",
        label: "Voiture",
        detail: "Essence · 4 pers.",
        icon: CarFront,
      },
      {
        value: "car_electric_1_passenger",
        label: "Voiture",
        detail: "Électrique · 1 pers.",
        icon: CarFront,
      },
      {
        value: "car_electric_2_passengers",
        label: "Voiture",
        detail: "Électrique · 2 pers.",
        icon: CarFront,
      },
      {
        value: "car_electric_3_passengers",
        label: "Voiture",
        detail: "Électrique · 3 pers.",
        icon: CarFront,
      },
      {
        value: "car_electric_4_passengers",
        label: "Voiture",
        detail: "Électrique · 4 pers.",
        icon: CarFront,
      },
      {
        value: "motorcycle_gasoline",
        label: "Moto",
        detail: "Essence",
        icon: Motorbike,
      },
      {
        value: "scooter_gasoline",
        label: "Scooter",
        detail: "Essence",
        icon: Motorbike,
      },
    ],
  },
  {
    title: "Transports en commun",
    modes: [
      { value: "plane", label: "Avion", icon: Plane },
      { value: "train_high_speed", label: "TGV", icon: TrainFront },
      { value: "train_intercity", label: "Intercités", icon: TrainFront },
      { value: "train_regional", label: "TER", icon: TrainFront },
      { value: "train_paris", label: "RER", icon: TrainFront },
      { value: "bus_gasoline_long_haul", label: "Autocar", icon: BusFront },
      {
        value: "bus_gasoline",
        label: "Bus",
        detail: "Essence",
        icon: BusFront,
      },
      {
        value: "bus_electric",
        label: "Bus",
        detail: "Électrique",
        icon: BusFront,
      },
      { value: "tram", label: "Tramway", icon: TramFront },
      { value: "metro", label: "Métro", icon: TramFront },
    ],
  },
  {
    title: "Mobilité douce",
    modes: [
      { value: "walk", label: "Marche", icon: Footprints },
      { value: "bike", label: "Vélo", icon: Bike },
      {
        value: "bike_electric",
        label: "Vélo",
        detail: "Électrique",
        icon: Bike,
      },
    ],
  },
];

const allModes = sections.flatMap((s) => s.modes);
const allModeValues = allModes.map((m) => m.value);

defineExpose({ allModeValues });

/* ── Selection helpers ── */

const selectedSet = computed(() => {
  if (props.multiple) {
    return new Set(props.modelValue ?? []);
  }
  return new Set(props.modelValue ? [props.modelValue] : []);
});

const noneSelected = computed(
  () => props.multiple && selectedSet.value.size === 0,
);

const allSelected = computed(
  () => props.multiple && selectedSet.value.size === allModes.length,
);

function isSelected(value) {
  return selectedSet.value.has(value);
}

function findMode(value) {
  return allModes.find((m) => m.value === value);
}

/* ── Trigger label ── */

function fullLabel(mode) {
  if (!mode) return "";
  return mode.detail ? `${mode.label} (${mode.detail})` : mode.label;
}

const triggerLabel = computed(() => {
  if (props.multiple) {
    if (allSelected.value) return "Tous les modes";
    if (noneSelected.value) return "Aucun mode";
    if (selectedSet.value.size === 1) {
      const mode = findMode([...selectedSet.value][0]);
      return fullLabel(mode) || "1 mode";
    }
    return `${selectedSet.value.size} modes`;
  }
  const mode = findMode(props.modelValue);
  return fullLabel(mode) || "Mode de transport";
});

const triggerIcon = computed(() => {
  if (!props.multiple && props.modelValue) {
    return findMode(props.modelValue)?.icon ?? Plane;
  }
  return null;
});

/* ── Actions ── */

function pickMode(mode) {
  if (props.multiple) {
    const current = [...(props.modelValue ?? [])];
    const idx = current.indexOf(mode.value);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(mode.value);
    }
    emit("update:modelValue", current);
  } else {
    emit("update:modelValue", mode.value);
    emit("select", mode);
    open.value = false;
  }
}

function toggleAll() {
  if (allSelected.value) {
    emit("update:modelValue", []);
  } else {
    emit(
      "update:modelValue",
      allModes.map((m) => m.value),
    );
  }
}
</script>

<template>
  <div class="transport-picker">
    <button type="button" class="tp-trigger" @click="open = true">
      <span class="tp-trigger-main">
        <component v-if="triggerIcon" :is="triggerIcon" size="16" />
        <span>{{ triggerLabel }}</span>
      </span>
      <ChevronDown size="15" class="tp-chevron" />
    </button>

    <Teleport to="body">
      <Transition name="tp-fade">
        <div v-if="open" class="tp-backdrop" @mousedown.self="open = false">
          <Transition name="tp-slide" appear>
            <div v-if="open" class="tp-popup" role="dialog" aria-modal="true">
              <div class="tp-header">
                <h3 class="tp-title">Mode de transport</h3>

                <button
                  v-if="multiple"
                  type="button"
                  class="tp-select-all"
                  :class="{ active: allSelected }"
                  @click="toggleAll"
                >
                  <CheckCheck size="14" />
                  <span>{{
                    allSelected ? "Tout désélectionner" : "Tout sélectionner"
                  }}</span>
                </button>

                <button
                  type="button"
                  class="tp-close"
                  @click="open = false"
                  aria-label="Fermer"
                >
                  <X size="18" />
                </button>
              </div>

              <div class="tp-sections">
                <section
                  v-for="section in sections"
                  :key="section.title"
                  class="tp-section"
                >
                  <h4 class="tp-section-title">{{ section.title }}</h4>
                  <div class="tp-grid">
                    <button
                      v-for="mode in section.modes"
                      :key="mode.value"
                      type="button"
                      class="tp-mode-btn"
                      :class="{ active: isSelected(mode.value) }"
                      @click="pickMode(mode)"
                    >
                      <component :is="mode.icon" size="16" />
                      <span class="tp-mode-text">
                        <span class="tp-mode-label">{{ mode.label }}</span>
                        <span v-if="mode.detail" class="tp-mode-detail">{{
                          mode.detail
                        }}</span>
                      </span>
                      <Check
                        v-if="isSelected(mode.value)"
                        size="13"
                        class="tp-check"
                      />
                    </button>
                  </div>
                </section>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* ── Trigger button ── */
.transport-picker {
  position: relative;
  width: 100%;
}

.tp-trigger {
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

.tp-trigger:hover,
.tp-trigger:focus {
  border-color: var(--primary);
  background: #ffffff;
  box-shadow: 0 0 0 3px oklch(70.62% 0.139 158.37 / 0.1);
  outline: none;
}

.tp-trigger-main {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
}

.tp-trigger-main :deep(svg) {
  color: var(--primary);
  flex-shrink: 0;
}

.tp-chevron {
  color: #94a3b8;
  flex-shrink: 0;
}

/* ── Backdrop ── */
.tp-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.35);
  backdrop-filter: blur(2px);
}

/* ── Popup ── */
.tp-popup {
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.18);
  width: min(92vw, 640px);
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tp-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e5e7eb;
}

.tp-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
}

.tp-select-all {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.65rem;
  border-radius: 999px;
  border: 1.5px solid #dbe3ec;
  background: #f8fbff;
  color: #475569;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tp-select-all:hover {
  border-color: var(--primary);
  background: #f0fdf4;
}

.tp-select-all.active {
  border-color: var(--primary);
  background: #f0fdf4;
  color: var(--primary);
}

.tp-close {
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: background 0.15s;
}

.tp-select-all + .tp-close {
  margin-left: 0;
}

.tp-close:hover {
  background: #f1f5f9;
  color: #0f172a;
}

/* ── Sections ── */
.tp-sections {
  padding: 0.75rem 1.25rem 1.25rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
  scrollbar-width: thin;
  scrollbar-color: oklch(70.62% 0.139 158.37 / 30%) transparent;
}

.tp-section-title {
  margin: 0 0 0.45rem;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #64748b;
}

.tp-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.45rem;
}

/* ── Mode button ── */
.tp-mode-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 38px;
  padding: 0.35rem 0.55rem;
  border-radius: 10px;
  border: 1.5px solid #dbe3ec;
  background: #ffffff;
  color: #475569;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tp-mode-btn :deep(svg:first-child) {
  color: #94a3b8;
  flex-shrink: 0;
  transition: color 0.15s ease;
}

.tp-mode-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  line-height: 1.2;
  min-width: 0;
  width: 100%;
}

.tp-mode-label {
  font-size: 0.78rem;
}

.tp-mode-detail {
  font-size: 0.65rem;
  font-weight: 400;
  color: #94a3b8;
  transition: color 0.15s ease;
}

.tp-mode-btn.active .tp-mode-detail {
  color: var(--primary);
}

.tp-mode-btn:hover {
  border-color: var(--primary);
  background: #fafffe;
}

.tp-mode-btn:hover :deep(svg:first-child) {
  color: var(--primary);
}

.tp-mode-btn.active {
  border-color: var(--primary);
  background: oklch(70.62% 0.139 158.37 / 8%);
  color: var(--primary);
  font-weight: 600;
}

.tp-mode-btn.active :deep(svg:first-child) {
  color: var(--primary);
}

.tp-check {
  margin-left: auto;
  color: var(--primary);
  flex-shrink: 0;
}

/* ── Transitions ── */
.tp-fade-enter-active,
.tp-fade-leave-active {
  transition: opacity 0.2s ease;
}

.tp-fade-enter-from,
.tp-fade-leave-to {
  opacity: 0;
}

.tp-slide-enter-active,
.tp-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.tp-slide-enter-from,
.tp-slide-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.97);
}

/* ── Responsive ── */
@media (max-width: 600px) {
  .tp-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .tp-popup {
    width: 96vw;
    max-height: 85vh;
  }
}
</style>
