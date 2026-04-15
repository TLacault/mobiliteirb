<template>
  <Teleport to="body">
    <Transition name="popup-fade">
      <div
        v-if="modelValue"
        class="globe-backdrop"
        @mousedown.self="$emit('update:modelValue', false)"
      >
        <Transition name="popup-slide" appear>
          <div
            v-if="modelValue"
            class="globe-popup"
            role="dialog"
            aria-modal="true"
          >
            <!-- Header -->
            <div class="globe-header">
              <div class="globe-header-left">
                <div class="globe-icon">
                  <Globe :size="20" />
                </div>
                <h2 class="globe-title">Globe des trajets</h2>
              </div>

              <!-- Trip selector -->
              <div class="trip-selector">
                <button class="trip-toggle-all" @click="toggleAll">
                  {{ allVisible ? "Tout masquer" : "Tout afficher" }}
                </button>
                <div
                  v-for="(t, idx) in tripEntries"
                  :key="t.id"
                  class="trip-chip"
                  :class="{ disabled: !t.visible }"
                  @click="toggleTrip(idx)"
                >
                  <span class="trip-dot" :style="{ background: t.color }" />
                  <span class="trip-name">{{ t.name }}</span>
                </div>
              </div>

              <button
                class="globe-close"
                @click="$emit('update:modelValue', false)"
                aria-label="Fermer"
              >
                <X :size="18" />
              </button>
            </div>

            <!-- Body -->
            <div class="globe-body">
              <p v-if="loading" class="globe-status">
                Chargement des coordonnées…
              </p>
              <p
                v-else-if="allArcs.length === 0 && !loading"
                class="globe-status"
              >
                Aucune étape géolocalisable trouvée.
              </p>
              <div ref="globeContainer" class="globe-container" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed, watch, onBeforeUnmount, nextTick } from "vue";
import { Globe, X } from "lucide-vue-next";
import { getSteps } from "~/utils/step_api";
import { geocodePlaces } from "~/utils/geocode";

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  trips: { type: Array, default: () => [] },
  isPreview: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

const globeContainer = ref(null);
const loading = ref(false);
const allArcs = ref([]);
const allPoints = ref([]);
let globeInstance = null;

// ── Trip visibility ──
const tripEntries = reactive([]);

const allVisible = computed(() => tripEntries.every((t) => t.visible));

function toggleTrip(idx) {
  tripEntries[idx].visible = !tripEntries[idx].visible;
  applyVisibility();
}

function toggleAll() {
  const next = !allVisible.value;
  tripEntries.forEach((t) => (t.visible = next));
  applyVisibility();
}

function applyVisibility() {
  if (!globeInstance) return;
  const visibleNames = new Set(
    tripEntries.filter((t) => t.visible).map((t) => t.name),
  );
  globeInstance
    .arcsData(allArcs.value.filter((a) => visibleNames.has(a.tripName)))
    .pointsData(allPoints.value.filter((p) => visibleNames.has(p.tripName)));
}

// ── Color palette ──
const TRIP_COLORS = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
  "#ec4899",
  "#14b8a6",
  "#a855f7",
];

function getColor(tripIndex) {
  return TRIP_COLORS[tripIndex % TRIP_COLORS.length];
}

// ── Data building ──
async function buildArcsData() {
  loading.value = true;
  allArcs.value = [];
  allPoints.value = [];
  tripEntries.length = 0;

  try {
    const tripSteps = await Promise.all(
      props.trips.map((t) => getSteps(t.id, props.isPreview).catch(() => [])),
    );

    const placeNames = new Set();
    for (const steps of tripSteps) {
      for (const s of steps) {
        if (s.labelStart) placeNames.add(s.labelStart);
        if (s.labelEnd) placeNames.add(s.labelEnd);
      }
    }

    if (placeNames.size === 0) {
      loading.value = false;
      return;
    }

    const coordsMap = await geocodePlaces([...placeNames]);

    const arcList = [];
    const pointMap = new Map();

    tripSteps.forEach((steps, tripIdx) => {
      const color = getColor(tripIdx);
      const name = props.trips[tripIdx]?.name ?? `Trajet ${tripIdx + 1}`;

      tripEntries.push({
        id: props.trips[tripIdx]?.id,
        name,
        color,
        visible: true,
      });

      for (const step of steps) {
        const from = coordsMap.get(step.labelStart);
        const to = coordsMap.get(step.labelEnd);
        if (!from || !to) continue;

        arcList.push({
          startLat: from.lat,
          startLng: from.lng,
          endLat: to.lat,
          endLng: to.lng,
          color,
          tripName: name,
          labelStart: step.labelStart,
          labelEnd: step.labelEnd,
        });

        if (!pointMap.has(step.labelStart)) {
          pointMap.set(step.labelStart, {
            lat: from.lat,
            lng: from.lng,
            label: step.labelStart,
            size: 0.4,
            color,
            tripName: name,
          });
        }
        if (!pointMap.has(step.labelEnd)) {
          pointMap.set(step.labelEnd, {
            lat: to.lat,
            lng: to.lng,
            label: step.labelEnd,
            size: 0.4,
            color,
            tripName: name,
          });
        }
      }
    });

    allArcs.value = arcList;
    allPoints.value = [...pointMap.values()];
  } catch (err) {
    console.error("Globe data build error:", err);
  } finally {
    loading.value = false;
  }
}

// ── Globe init ──
function waitForLayout() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

async function initGlobe() {
  if (!globeContainer.value) return;

  await waitForLayout();

  const Globe = (await import("globe.gl")).default;

  const width = globeContainer.value.clientWidth || 800;
  const height = globeContainer.value.clientHeight || 600;

  globeInstance = Globe()(globeContainer.value)
    .width(width)
    .height(height)
    .globeImageUrl("//unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
    .backgroundImageUrl("//unpkg.com/three-globe/example/img/night-sky.png")
    .arcColor("color")
    .arcAltitude((d) => {
      const toRad = Math.PI / 180;
      const lat1 = d.startLat * toRad;
      const lat2 = d.endLat * toRad;
      const dlat = (d.endLat - d.startLat) * toRad;
      const dlng = (d.endLng - d.startLng) * toRad;
      const a =
        Math.sin(dlat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlng / 2) ** 2;
      const angDist = 2 * Math.asin(Math.sqrt(a));
      // Slight curve: short arcs ≈ 0.08, transatlantic ≈ 0.3
      return Math.max(0.05, (angDist / Math.PI) * 0.35);
    })
    .arcDashLength(0.4)
    .arcDashGap(0.2)
    .arcDashAnimateTime(1500)
    .arcStroke(0.8)
    .arcLabel(
      (d) =>
        `<div style="font-family:sans-serif;font-size:12px;padding:4px 8px;background:rgba(0,0,0,0.7);color:#fff;border-radius:6px;">
          <b>${d.tripName}</b><br/>${d.labelStart} → ${d.labelEnd}
        </div>`,
    )
    .pointsData(allPoints.value)
    .pointLat("lat")
    .pointLng("lng")
    .pointColor("color")
    .pointAltitude(0.01)
    .pointRadius("size")
    .pointLabel("label")
    .arcsData(allArcs.value);

  // No auto-rotate — let the user manipulate freely
  globeInstance.controls().autoRotate = false;

  // Start centered on France
  globeInstance.pointOfView({ lat: 46.6, lng: 2.3, altitude: 2.2 }, 0);
}

function destroyGlobe() {
  if (globeInstance) {
    globeInstance._destructor?.();
    globeInstance = null;
  }
  if (globeContainer.value) {
    globeContainer.value.innerHTML = "";
  }
}

watch(
  () => props.modelValue,
  async (open) => {
    if (open) {
      await buildArcsData();
      await nextTick();
      await initGlobe();
    } else {
      destroyGlobe();
    }
  },
);

onBeforeUnmount(() => {
  destroyGlobe();
});
</script>

<style scoped>
/* Backdrop — starts below the navbar (73px) */
.globe-backdrop {
  position: fixed;
  top: 73px;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

/* Popup — 90% of the available space below navbar */
.globe-popup {
  position: relative;
  z-index: 901;
  height: 90%;
  aspect-ratio: 1;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header */
.globe-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 1.5rem;
  flex-shrink: 0;
  border-bottom: 1px solid #f3f4f6;
}

.globe-header-left {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-shrink: 0;
}

.globe-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: oklch(70.62% 0.139 158.37 / 0.12);
  color: var(--primary);
  flex-shrink: 0;
}

.globe-title {
  font-family: var(--font-ubuntu);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
}

/* Trip selector chips */
.trip-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  overflow-x: auto;
  padding: 0 0.5rem;
}

.trip-toggle-all {
  display: flex;
  align-items: center;
  padding: 0.3rem 0.75rem;
  border: 1.5px solid #d1d5db;
  background: white;
  border-radius: 100px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text);
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.trip-toggle-all:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.trip-chip {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.7rem;
  border-radius: 100px;
  border: 1.5px solid #e5e7eb;
  background: white;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.15s ease, background 0.15s ease;
}

.trip-chip:hover {
  background: #f9fafb;
}

.trip-chip.disabled {
  opacity: 0.4;
}

.trip-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.trip-name {
  font-size: 0.78rem;
  color: var(--text);
  font-weight: 500;
}

/* Close */
.globe-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 8px;
  color: var(--text);
  opacity: 0.45;
  cursor: pointer;
  transition: opacity 0.15s ease, background 0.15s ease;
  flex-shrink: 0;
  margin-left: auto;
}

.globe-close:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.06);
}

/* Body */
.globe-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 0;
}

.globe-container {
  flex: 1;
  width: 100%;
  min-height: 0;
  overflow: hidden;
}

.globe-status {
  padding: 2rem;
  color: #6b7280;
  font-size: 0.95rem;
  text-align: center;
}

/* Transitions */
.popup-fade-enter-active,
.popup-fade-leave-active {
  transition: opacity 0.2s ease;
}
.popup-fade-enter-from,
.popup-fade-leave-to {
  opacity: 0;
}

.popup-slide-enter-active,
.popup-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.popup-slide-enter-from,
.popup-slide-leave-to {
  opacity: 0;
  transform: scale(0.97) translateY(8px);
}
</style>
