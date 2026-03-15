<script setup>
import { Leaf, Timer, MapPin, Ruler } from "lucide-vue-next";

const props = defineProps({
  trip: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["toggle"]);
</script>

<template>
  <div
    class="card-container"
    :class="{ 'card-unselected': !trip.isSelected }"
    @click="emit('toggle', !trip.isSelected)"
  >
    <div class="card-header">
      <div class="trip-title body">
        <div class="index body">{{ index + 1 }}.</div>
        <p>"{{ trip.name || "Trajet sans nom" }}"</p>
      </div>

      <label class="toggle" @click.stop>
        <input
          type="checkbox"
          :checked="trip.isSelected"
          @change="emit('toggle', $event.target.checked)"
        />
        <span class="toggle-track"></span>
        <span class="body">synthèse</span>
      </label>
    </div>

    <div class="card-content">
      <div class="trip-section">
        <div class="route-visual">
          <div class="start-dot"></div>
          <div class="line"></div>
          <div class="end-dot"></div>
        </div>

        <div class="route-detail">
          <div class="step">
            <p>{{ trip.from || "—" }}</p>
          </div>
          <div class="step">
            <p>{{ trip.to || "—" }}</p>
          </div>
        </div>
      </div>

      <div class="stats-section">
        <div class="stat-section detail">
          <div class="icon"><Leaf size="18" /></div>
          <p>{{ trip.emissions }} kg CO₂</p>
        </div>
        <div class="stat-section detail">
          <div class="icon"><Timer size="18" /></div>
          <p>
            {{
              Math.floor(trip.time / 60) > 0
                ? Math.floor(trip.time / 60) + "h "
                : ""
            }}
            {{ trip.time % 60 }} min
          </p>
        </div>
        <div class="stat-section detail">
          <div class="icon"><MapPin size="18" /></div>
          <p>{{ trip.steps }} étape{{ trip.steps !== 1 ? "s" : "" }}</p>
        </div>
        <div class="stat-section detail">
          <div class="icon"><Ruler size="18" /></div>
          <p>{{ trip.distance }} km</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-container {
  flex-wrap: nowrap;
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem 1rem;
  border-radius: 15px;
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--primary);
  align-items: center;
  cursor: pointer;
}

.card-unselected {
  border-style: dashed;
}

.card-header {
  padding: 0rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.trip-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.index {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  font-size: var(--font-body);
  font-weight: 600;
}

.card-content {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  padding: 0rem 1.5rem;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(2, auto);
  justify-content: space-between;
  width: 60%;
  margin-left: 1rem;
  padding: 0rem 1rem;
}

.stat-section {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: var(--text);
  white-space: nowrap;
  padding: 0rem 0.5rem;
}

.icon {
  display: flex;
  align-items: center;
  width: 18px;
  height: 18px;
}

.trip-section {
  display: flex;
  align-items: center;
  margin-right: 1rem;
}

.step {
  padding: 0.25rem 1rem;
  min-width: 120px;
  text-align: center;
  border-radius: 100px;
  color: white;
  background-color: var(--accent);
}

.route-visual {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #7299cf;
  margin: 0 1rem;
}

.route-detail {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Le petit cercle au départ */
.start-dot {
  width: 15px;
  aspect-ratio: 1;
  background-color: white;
  border: 4px solid currentColor;
  border-radius: 50%;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

/* La ligne verticale */
.line {
  height: 50px;
  width: 4px;
  background-color: currentColor;
  margin: -4px 0;
  border-radius: 1.5rem;
}

/* Le petit cercle à la fin */
.end-dot {
  width: 15px;
  aspect-ratio: 1;
  background-color: white;
  border: 4px solid currentColor;
  border-radius: 50%;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.toggle {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 400;
  color: #6b7280;
}

.toggle input {
  display: none;
}

.toggle-track {
  width: 36px;
  height: 20px;
  background-color: #d1d5db;
  border-radius: 100px;
  position: relative;
  transition: background-color 0.2s ease;
  flex-shrink: 0;
}

.toggle-track::after {
  content: "";
  position: absolute;
  top: 3px;
  left: 3px;
  width: 14px;
  height: 14px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.2s ease;
}

.toggle input:checked ~ .toggle-track {
  background-color: var(--primary);
}

.toggle input:checked ~ .toggle-track::after {
  transform: translateX(16px);
}
</style>
