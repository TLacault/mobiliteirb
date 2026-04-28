<script setup>
import {
  Trash2,
  TicketsPlane,
  Leaf,
  Timer,
  MapPin,
  Ruler,
  PencilRuler,
  CalendarCheck2,
  PlaneTakeoff,
  PlaneLanding,
} from "lucide-vue-next";
import {
  getMobility,
  getMobilityStats,
  deleteMobility,
} from "../../utils/mobility_api.js";
import PopupDelete from "../popup/PopupDelete.vue";

const showForm = ref(false);
const emit = defineEmits(["mobility-deleted"]);

const { notify } = useNotification();
const { selectMobilite } = useMobiliteSession();

const handleEdit = () => {
  selectMobilite(props.uuid);
  navigateTo(`/mobilite/${props.uuid}/synthese`);
};

const props = defineProps({
  uuid: {
    type: String,
    required: true,
  },
});

const mobility = ref(null);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    const [details, stats] = await Promise.all([
      getMobility(props.uuid),
      getMobilityStats(props.uuid),
    ]);
    mobility.value = {
      ...details,
      stats,
    };
  } catch (e) {
    error.value = e.message || "Erreur lors du chargement";
  } finally {
    loading.value = false;
  }
});

const formattedDate = computed(() => {
  if (!mobility.value?.lastEdit) return "—";
  return new Date(mobility.value.lastEdit).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
});

async function deleteMobilite(uuid) {
  try {
    await deleteMobility(uuid);
    notify("success", "Mobilité supprimée avec succès.");
    emit("mobility-deleted", uuid);
  } catch (err) {
    console.error("Erreur à la suppression de la mobilité", err);
  }
}
</script>

<template>
  <!-- Chargement -->
  <div
    v-if="loading"
    class="card-container card-loading reveal-on-scroll reveal-up"
  >
    <p>Chargement...</p>
  </div>

  <!-- Erreur -->
  <div
    v-else-if="error"
    class="card-container card-error reveal-on-scroll reveal-up"
  >
    <p>{{ error }}</p>
  </div>

  <!-- Données -->
  <div v-else-if="mobility" class="card-container reveal-on-scroll reveal-up">
    <!-- Boutton-->
    <button class="trash-button" @click="showForm = true">
      <Trash2 size="15" />
    </button>
    <PopupDelete v-model="showForm" @confirm="deleteMobilite(props.uuid)" />
    <div class="card-title">
      <div class="icon"><TicketsPlane color="var(--primary)" /></div>
      <p>{{ mobility.name }}</p>
    </div>
    <div class="stats-section">
      <div class="stat-badge">
        <Leaf size="12" class="stat-icon" />
        <span>{{ mobility.stats.totalCarbon }} kg CO₂</span>
      </div>
      <div class="stat-badge">
        <Timer size="12" class="stat-icon" />
        <span>
          {{
            Math.floor(mobility.stats.totalTime / 60) > 0
              ? Math.floor(mobility.stats.totalTime / 60) + "h "
              : ""
          }}{{ mobility.stats.totalTime % 60 }} min
        </span>
      </div>
      <div class="stat-badge">
        <Ruler size="12" class="stat-icon" />
        <span>{{ mobility.stats.totalDistance }} km</span>
      </div>
      <div class="stat-badge">
        <MapPin size="12" class="stat-icon" />
        <span>
          {{ mobility.stats.stepCount }} étape{{
            mobility.stats.stepCount !== 1 ? "s" : ""
          }}
        </span>
      </div>
    </div>

    <div class="traject-section">
      <div class="location-row">
        <span class="location-label">
          <PlaneTakeoff size="14" />
          Départ
        </span>
        <span class="location-value">{{ mobility.startLocation || "—" }}</span>
      </div>
      <div class="location-row">
        <span class="location-label">
          <PlaneLanding size="14" />
          Arrivée
        </span>
        <span class="location-value">{{ mobility.endLocation || "—" }}</span>
      </div>
    </div>

    <div class="footer-section">
      <div class="modifier-btn" @click="handleEdit">
        <PencilRuler size="18" />
        <p>Modifier</p>
      </div>
      <div class="date-modification">
        <div class="text">
          <div class="icon"><CalendarCheck2 size="10" /></div>
          <p>Dernière modification</p>
        </div>
        <div class="date-value">
          <p>{{ formattedDate }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-loading,
.card-error {
  justify-content: center;
  color: #9ca3af;
  font-size: 0.9rem;
  min-height: 120px;
}
.card-error {
  color: #ef4444;
}

.card-container {
  flex-wrap: wrap;
  max-width: 550px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-radius: 15px;
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--primary);
  align-items: flex-start;
}
.trash-button {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: #fff;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  color: #9ca3af;
  border-radius: 999px;
  transition: color 0.15s, background 0.15s, border-color 0.15s;

  &:hover {
    color: #ef4444;
    border-color: oklch(63.066% 0.194 29.425 / 0.25);
    background: oklch(63.066% 0.194 29.425 / 0.08);
  }
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  padding-right: 2.5rem;
}

.stats-section {
  display: flex;
  gap: 0.4rem;
  justify-content: flex-start;
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
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1;
}

.stat-badge :deep(svg) {
  color: var(--primary);
  flex-shrink: 0;
}

.stat-icon {
  flex-shrink: 0;
  color: var(--primary);
}

.traject-section {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  width: 100%;
}

.location-row {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  align-items: center;
  gap: 0.45rem;
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

.location-label svg {
  color: var(--primary);
  flex-shrink: 0;
}

.location-value {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 0.42rem 0.6rem;
  font-size: 0.82rem;
  font-family: var(--font-inter);
  color: var(--text);
  background: #f8fafc;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.footer-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.modifier-btn {
  display: flex;
  padding: 0.4rem 1.2rem;
  min-width: 120px;
  text-align: center;
  border-radius: 100px;
  color: white;
  background: var(--gradientCallToAction);
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.88rem;
  font-weight: 500;

  transition: all 0.3s ease-in-out;
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    transform: translateY(-1px);
  }
}

.date-modification {
  line-height: 1;
  color: #6b7280;
  font-size: 0.6rem;
}

.text {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.date-value {
  padding: 0.2rem 1.1rem;
}

@media (max-width: 600px) {
  .card-container {
    padding: 1rem 1.1rem;
    gap: 0.85rem;
  }

  .trash-button {
    top: 1rem;
    right: 1rem;
  }

  .stats-section {
    flex-wrap: wrap;
  }

  .footer-section {
    flex-wrap: wrap;
    gap: 0.75rem;
    width: 100%;
  }

  .modifier-btn {
    flex: 1;
    justify-content: center;
  }
}
</style>
