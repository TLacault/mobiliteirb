<script setup>
import MobiliteHeader from "../../../components/mobilite/MobiliteHeader.vue";
import { getMobility } from "../../../utils/mobiliteAPI.js";

definePageMeta({ middleware: "auth" });

const route = useRoute();
const uuid = computed(() => route.params.uuid);

const { selectMobilite, setLastTab } = useMobiliteSession();

// Marque la mobilité comme sélectionnée (mode édition) et mémorise l'onglet
onMounted(() => {
  selectMobilite(uuid.value);
  setLastTab(uuid.value, "trajets");
});

// Données de la mobilité
const mobility = ref(null);
const loading = ref(true);
const error = ref(null);

const loadMobility = async () => {
  loading.value = true;
  error.value = null;
  try {
    mobility.value = await getMobility(uuid.value);
  } catch (e) {
    error.value = e.message || "Erreur lors du chargement";
  } finally {
    loading.value = false;
  }
};

onMounted(loadMobility);

useHead({
  title: computed(() => `Trajets — ${mobility.value?.name ?? "Mobilité"}`),
});

// Mise à jour locale des champs modifiés depuis le header
const handleUpdated = (patch) => {
  if (mobility.value) {
    Object.assign(mobility.value, patch);
  }
};
</script>

<template>
  <div class="scene-page">
    <div v-if="loading" class="loading-state">Chargement...</div>
    <div v-else-if="error" class="error-state">{{ error }}</div>
    <template v-else>
      <MobiliteHeader
        :uuid="uuid"
        :mobility="mobility"
        @updated="handleUpdated"
      />
    </template>
  </div>
</template>

<style scoped>
.scene-page {
  min-height: calc(100vh - 73px);
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
}

.scene-content {
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
}

.loading-state,
.error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 73px);
  font-size: 1rem;
  color: #6b7280;
}

.error-state {
  color: #ef4444;
}
</style>
