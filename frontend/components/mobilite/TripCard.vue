<script setup>
import { ref, watch, computed } from "vue";
import {
  Leaf,
  Timer,
  MapPin,
  Ruler,
  Trash2,
  Pencil,
  ArrowDownWideNarrow,
} from "lucide-vue-next";
import PopupDelete from "../popup/PopupDelete.vue";

const props = defineProps({
  trip: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  showToggle: {
    type: Boolean,
    default: true,
  },
  showDelete: {
    type: Boolean,
    default: false,
  },
  highlightedStat: {
    type: String,
    default: null,
  },
  activeSortField: {
    type: String,
    default: null,
  },
  activeSortDirection: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(["toggle", "updated", "deleted", "sort-requested"]);

const tripName = ref(props.trip.name ?? "");
const showDeletePopup = ref(false);

watch(
  () => props.trip.name,
  (newName) => {
    tripName.value = newName ?? "";
  },
);

const formattedDuration = computed(() => {
  const minutes = Number(props.trip.time ?? 0);
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  return `${hours > 0 ? `${hours}h ` : ""}${mins} min`;
});

function commitTripName() {
  const nextName = tripName.value.trim();
  const currentName = (props.trip.name ?? "").trim();
  if (nextName === currentName) return;
  emit("updated", { name: nextName || null });
}

function handleCardClick() {
  if (!props.showToggle) return;
  emit("toggle", !props.trip.isSelected);
}

function confirmDelete() {
  emit("deleted", props.trip.id);
}

function sortDirectionFor(statField) {
  if (props.activeSortField !== statField) return null;
  return props.activeSortDirection;
}

function requestSort(statField) {
  emit("sort-requested", statField);
}
</script>

<template>
  <div
    class="card-container"
    :class="{
      'card-unselected': showToggle && !trip.isSelected,
      'card-clickable': showToggle,
    }"
    @click="handleCardClick"
  >
    <div class="card-header">
      <div class="trip-title body">
        <div class="index body">{{ index + 1 }}.</div>
        <div class="trip-name-field">
          <input
            v-model="tripName"
            class="trip-name-input"
            type="text"
            placeholder="Trajet sans nom"
            title="Cliquer pour renommer"
            @click.stop
            @keydown.enter.prevent="$event.target.blur()"
            @blur="commitTripName"
          />
          <span class="edit-hint" aria-hidden="true">
            <Pencil size="13" />
            Modifier
          </span>
        </div>
      </div>

      <label v-if="showToggle" class="toggle" @click.stop>
        <input
          type="checkbox"
          :checked="trip.isSelected"
          @change="emit('toggle', $event.target.checked)"
        />
        <span class="toggle-track"></span>
        <span class="body">synthèse</span>
      </label>

      <button
        v-if="showDelete"
        class="delete-btn"
        title="Supprimer le trajet"
        @click.stop="showDeletePopup = true"
      >
        <Trash2 size="16" />
      </button>
    </div>

    <div class="stats-section">
      <div
        class="stat-badge"
        :class="{ highlighted: highlightedStat === 'emissions' }"
        @click.stop="requestSort('emissions')"
      >
        <Leaf size="16" />
        <span>{{ Number(trip.emissions ?? 0).toFixed(1) }} kg CO₂</span>
        <ArrowDownWideNarrow
          size="14"
          class="stat-sort-icon"
          :class="{
            active: !!sortDirectionFor('emissions'),
            asc: sortDirectionFor('emissions') === 'asc',
          }"
        />
      </div>
      <div
        class="stat-badge"
        :class="{ highlighted: highlightedStat === 'time' }"
        @click.stop="requestSort('duration')"
      >
        <Timer size="16" />
        <span>{{ formattedDuration }}</span>
        <ArrowDownWideNarrow
          size="14"
          class="stat-sort-icon"
          :class="{
            active: !!sortDirectionFor('duration'),
            asc: sortDirectionFor('duration') === 'asc',
          }"
        />
      </div>
      <div
        class="stat-badge"
        :class="{ highlighted: highlightedStat === 'steps' }"
        @click.stop="requestSort('steps')"
      >
        <MapPin size="16" />
        <span
          >{{ trip.steps ?? 0 }} étape{{ trip.steps !== 1 ? "s" : "" }}</span
        >
        <ArrowDownWideNarrow
          size="14"
          class="stat-sort-icon"
          :class="{
            active: !!sortDirectionFor('steps'),
            asc: sortDirectionFor('steps') === 'asc',
          }"
        />
      </div>
      <div
        class="stat-badge"
        :class="{ highlighted: highlightedStat === 'distance' }"
        @click.stop="requestSort('distance')"
      >
        <Ruler size="16" />
        <span>{{ Number(trip.distance ?? 0).toFixed(1) }} km</span>
        <ArrowDownWideNarrow
          size="14"
          class="stat-sort-icon"
          :class="{
            active: !!sortDirectionFor('distance'),
            asc: sortDirectionFor('distance') === 'asc',
          }"
        />
      </div>
    </div>

    <PopupDelete
      v-model="showDeletePopup"
      :item-name="trip.name || 'ce trajet'"
      @confirm="confirmDelete"
    />
  </div>
</template>

<style scoped>
.card-container {
  flex-wrap: nowrap;
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem 1rem;
  border-radius: 15px;
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--primary);
  align-items: stretch;
  cursor: default;

  transition: all 0.3s ease-in-out;
  &:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
}

.card-clickable {
  cursor: pointer;
}

.card-unselected {
  border-style: dashed;
}

.card-header {
  padding: 0rem 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  width: 100%;
}

.trip-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
}

.index {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  font-size: var(--font-body);
  font-weight: 600;
}

.trip-name-input {
  width: 100%;
  min-width: 0;
  border: 1px dashed transparent;
  border-radius: 10px;
  background: transparent;
  color: var(--text);
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.2;
  padding: 0.38rem 0.55rem;
  padding-right: 5.6rem;
  transition: border-color 0.2s ease, background-color 0.2s ease;
  cursor: text;
}

.trip-name-input::placeholder {
  color: #9ca3af;
  font-weight: 600;
}

.trip-title:hover .trip-name-input {
  border-color: #c9d3e2;
  background-color: #f8fafc;
}

.trip-name-input:focus {
  outline: none;
  border-color: var(--primary);
  background-color: #f3fdf8;
}

.trip-name-field {
  position: relative;
  width: 100%;
  min-width: 0;
}

.edit-hint {
  position: absolute;
  right: 0.55rem;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: #94a3b8;
  font-size: 0.72rem;
  font-weight: 600;
  pointer-events: none;
  opacity: 0.85;
  transition: color 0.2s ease, opacity 0.2s ease;
}

.trip-title:hover .edit-hint,
.trip-name-input:focus + .edit-hint {
  color: var(--primary);
  opacity: 1;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
  width: 100%;
  padding: 0rem 0.75rem;
}

.stat-badge {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  color: #374151;
  white-space: nowrap;
  padding: 0.5rem 0.65rem;
  border-radius: 999px;
  border: 1px solid transparent;
  background: #f9fafb;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease,
    color 0.2s ease;
}

.stat-badge:hover {
  border-color: color-mix(in oklab, var(--primary) 35%, #ffffff);
  background: color-mix(in oklab, var(--primary) 10%, #ffffff);
  color: color-mix(in oklab, var(--primary) 80%, #1f2937);
}

.stat-badge.highlighted {
  border-color: color-mix(in oklab, var(--primary) 35%, #ffffff);
  background: color-mix(in oklab, var(--primary) 10%, #ffffff);
  color: color-mix(in oklab, var(--primary) 80%, #1f2937);
}

.stat-badge :deep(svg) {
  color: var(--primary);
  flex-shrink: 0;
}

.stat-sort-icon {
  margin-left: auto;
  color: var(--primary);
  opacity: 0;
  transform: rotate(0deg);
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.stat-sort-icon.active {
  opacity: 1;
}

.stat-badge:hover .stat-sort-icon {
  opacity: 1;
}

.stat-sort-icon.asc {
  transform: rotate(180deg);
}

.toggle {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 400;
  color: #6b7280;
  flex-shrink: 0;
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

.delete-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #9ca3af;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.delete-btn:hover {
  color: var(--danger);
  border-color: oklch(63.066% 0.194 29.425 / 45%);
  background: oklch(63.066% 0.194 29.425 / 8%);
}
</style>
