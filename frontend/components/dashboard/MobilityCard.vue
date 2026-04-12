<script setup>
import {
  Trash2,
  Briefcase,
  Leaf,
  Timer,
  MapPin,
  PencilRuler,
  CalendarCheck2,
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
    <div class="trash-button" @click="showForm = true">
      <Trash2 color="red" />
    </div>
    <PopupDelete v-model="showForm" @confirm="deleteMobilite(props.uuid)" />
    <div class="card-title">
      <div class="icon"><Briefcase color="var(--primary)" /></div>
      <p>{{ mobility.name }}</p>
    </div>
    <div class="stats-section">
      <div class="stat-section">
        <div class="icon"><Leaf size="18" /></div>
        <p>{{ mobility.stats.totalCarbon }} kg CO₂</p>
      </div>
      <div class="stat-section">
        <div class="icon"><Timer size="18" /></div>
        <p>
          {{
            Math.floor(mobility.stats.totalTime / 60) > 0
              ? Math.floor(mobility.stats.totalTime / 60) + "h "
              : ""
          }}
          {{ mobility.stats.totalTime % 60 }} min
        </p>
      </div>
      <div class="stat-section">
        <div class="icon"><MapPin size="18" /></div>
        <p>
          {{ mobility.stats.stepCount }} étape{{
            mobility.stats.stepCount !== 1 ? "s" : ""
          }}
        </p>
      </div>
    </div>

    <div class="traject-section">
      <div class="departure-point etape">
        <p>{{ mobility.startLocation }}</p>
      </div>
      <div class="route-visual">
        <div class="start-dot"></div>
        <div class="line"></div>
        <div class="arrow-head"></div>
      </div>
      <div class="destination-point etape">
        <p>{{ mobility.endLocation }}</p>
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
  max-width: 500px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  border-radius: 15px;
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--primary);
  align-items: center;
}
.trash-button {
  position: absolute;
  top: 1.3rem;
  right: 1.3rem;
  padding: 0.4rem;
  border-radius: 100px;
  transition: all 0.3s ease-in-out;

  &:hover {
    background-color: rgba(255, 0, 0, 0.1);
  }
}

.card-title {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  font-weight: 600;
}

.stats-section {
  display: flex;
  gap: 2rem;
  flex: 1;
  margin-bottom: -0.5rem;
}

.stat-section {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 15px;
  color: #9ca3af;
}

.traject-section {
  /* outline: 1px solid red; */
  display: flex;
  align-items: center;
  /* gap: 0.5rem; */
}
.etape {
  padding: 0.25rem 1rem;
  min-width: 120px;
  text-align: center;
  border-radius: 100px;
  color: white;
  background-color: var(--accent);
}

.route-visual {
  display: flex;
  align-items: center;
  color: #7299cf;
  margin: 0 1rem;
}

/* Le petit cercle au début */
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

/* La ligne horizontale */
.line {
  height: 4px;
  width: 70px;
  background-color: currentColor;
  margin: 0 -4px;
  border-radius: 1.5rem;
}

.arrow-head {
  width: 14px;
  height: 14px;
  border-top: 4px solid currentColor;
  border-right: 4px solid currentColor;

  border-top-right-radius: 3px;
  border-bottom-left-radius: 2px;
  border-top-left-radius: 2px;

  transform: rotate(45deg);
  margin-left: -8px;
}

.footer-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.modifier-btn {
  display: flex;
  padding: 0.2rem 1rem;
  min-width: 120px;
  text-align: center;
  border-radius: 5px;
  color: white;
  background: var(--primary);
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;

  transition: all 0.3s ease-in-out;
  &:hover {
    background-color: var(--tertiary);
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
</style>
