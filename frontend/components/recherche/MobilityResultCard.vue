<script setup>
import { ref, computed } from "vue";
import {
  Briefcase,
  Leaf,
  Timer,
  Ruler,
  MapPin,
  PlaneTakeoff,
  PlaneLanding,
  Eye,
  User,
} from "lucide-vue-next";
import PopupAuthor from "~/components/popup/PopupAuthor.vue";

const { setPreviewMode, selectMobilite } = useMobiliteSession();

const props = defineProps({
  mobility: {
    type: Object,
    required: true,
  },
});

const handleViewDetails = () => {
  selectMobilite(props.mobility.id);
  setPreviewMode(true);
  navigateTo(`/mobilite/${props.mobility.id}/synthese`);
};

const authorLabel = computed(
  () => props.mobility.author?.casLogin ?? "Anonyme",
);
const authorEmail = computed(() => props.mobility.author?.email ?? null);
const isAnonymous = computed(
  () =>
    !props.mobility.author?.casLogin ||
    props.mobility.author.casLogin === "Anonyme",
);

const showAuthorPopup = ref(false);
const badgeRef = ref(null);
const popupPosition = ref({});

function openAuthorPopup() {
  if (isAnonymous.value) return;
  if (badgeRef.value) {
    const rect = badgeRef.value.getBoundingClientRect();
    popupPosition.value = {
      position: "fixed",
      top: `${rect.bottom + 6}px`,
      left: `${rect.left}px`,
      zIndex: 9999,
    };
  }
  showAuthorPopup.value = true;
}

function formatTime(totalMinutes) {
  const minutes = Number(totalMinutes ?? 0);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours <= 0) return `${mins} min`;
  if (mins === 0) return `${hours} h`;
  return `${hours} h ${mins} min`;
}

function formatDistance(km) {
  const val = Number(km ?? 0);
  if (val >= 1000) return `${(val / 1000).toFixed(1)}k km`;
  return `${Math.round(val)} km`;
}

function formatCarbon(kg) {
  const val = Number(kg ?? 0);
  return `${val.toFixed(1)} kg`;
}
</script>

<template>
  <div class="result-card">
    <div class="row-top">
      <Briefcase :size="15" class="name-icon" />
      <span class="name-text">{{ mobility.name }}</span>
      <span
        ref="badgeRef"
        class="author-badge"
        :class="{ anonymous: isAnonymous, clickable: !isAnonymous }"
        @click.stop="openAuthorPopup"
      >
        <User :size="12" />
        {{ authorLabel }}
      </span>

      <PopupAuthor
        :show="showAuthorPopup"
        :cas-login="authorLabel"
        :email="authorEmail"
        :position="popupPosition"
        @close="showAuthorPopup = false"
      />
      <span class="top-sep" />
      <div class="location">
        <PlaneTakeoff :size="14" class="icon-departure" />
        <span>{{ mobility.startLocation }}</span>
      </div>
      <div class="location">
        <PlaneLanding :size="14" class="icon-arrival" />
        <span>{{ mobility.endLocation }}</span>
      </div>
    </div>

    <div class="h-divider" />

    <div class="row-bottom">
      <div class="stats-grid">
        <div class="stat">
          <Leaf :size="13" />
          <span>{{ formatCarbon(mobility.stats.totalCarbon) }} kg CO₂</span>
        </div>
        <div class="stat">
          <MapPin :size="13" />
          <span
            >{{ mobility.stats.stepCount }} étape{{
              mobility.stats.stepCount !== 1 ? "s" : ""
            }}</span
          >
        </div>
        <div class="stat">
          <Ruler :size="13" />
          <span>{{ formatDistance(mobility.stats.totalDistance) }}</span>
        </div>
        <div class="stat">
          <Timer :size="13" />
          <span>{{ formatTime(mobility.stats.totalTime) }}</span>
        </div>
      </div>

      <button
        class="details-btn"
        @click="handleViewDetails"
      >
        <Eye :size="15" />
        <span>Voir détails</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.result-card {
  display: flex;
  flex-direction: column;
  padding: 0.85rem 1.1rem;
  border-radius: 12px;
  background: #fff;
  border: 1.5px solid #e5e7eb;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
}

.result-card:hover {
  border-color: var(--primary);
  box-shadow: 0 2px 12px oklch(70.62% 0.139 158.37 / 10%);
}

/* Row 1 */
.row-top {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  white-space: nowrap;
  overflow: hidden;
  padding-bottom: 0.65rem;
}

.name-icon {
  flex-shrink: 0;
  color: var(--primary);
}

.name-text {
  font-size: 0.92rem;
  font-weight: 650;
  color: #1e293b;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.author-badge {
  position: relative;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.3rem 0.55rem;
  border-radius: 999px;
  background: oklch(70.62% 0.139 158.37 / 15%);
  color: var(--primary);
  line-height: 1;
}

.author-badge.clickable {
  cursor: pointer;
  transition: background 0.15s ease;
}

.author-badge.clickable:hover {
  background: oklch(70.62% 0.139 158.37 / 25%);
}

.author-badge.anonymous {
  background: #f1f5f9;
  color: #94a3b8;
  cursor: default;
}

.top-sep {
  display: inline-block;
  width: 1px;
  height: 14px;
  background: #e2e8f0;
  flex-shrink: 0;
  margin: 0 0.1rem;
}

.location {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex-shrink: 0;
}

.location span {
  font-size: 0.82rem;
  font-weight: 550;
  color: #334155;
}

.icon-departure {
  flex-shrink: 0;
  color: var(--primary);
}
.icon-arrival {
  flex-shrink: 0;
  color: var(--primary);
}

/* Divider */
.h-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 0 -1.1rem;
}

/* Row 2 */
.row-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 0.65rem;
}

.stats-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.78rem;
  color: #64748b;
  white-space: nowrap;
  background-color: #f1f5f9;
  padding: 0.2rem 0.8rem;
  border-radius: 100px;
}

.stat svg {
  flex-shrink: 0;
  color: #94a3b8;
}

/* CTA */
.details-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 9px;
  background: var(--gradientCallToAction);
  color: #fff;
  font-size: 0.8rem;
  font-weight: 650;
  cursor: pointer;
  white-space: nowrap;
  transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
}

.details-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px oklch(70.62% 0.139 158.37 / 25%);
  filter: brightness(1.02);
}
</style>
