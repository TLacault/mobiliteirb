<script setup>
import MobiliteHeader from "../../../components/mobilite/MobiliteHeader.vue";
import TripsGrid from "../../../components/mobilite/TripsGrid.vue";
import { getMobility } from "../../../utils/mobility_api.js";

definePageMeta({ middleware: "auth" });

const route = useRoute();
const uuid = computed(() => route.params.uuid);

const { selectMobilite, setLastTab } = useMobiliteSession();

onMounted(() => {
  selectMobilite(uuid.value);
  setLastTab(uuid.value, "trajets");
});

const mobility = ref(null);
const loading = ref(true);
const error = ref(null);

const isPreview = computed(() => route.query.preview === "true");

const loadMobility = async () => {
  loading.value = true;
  error.value = null;
  try {
    mobility.value = await getMobility(uuid.value, isPreview.value);
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
      <div class="scene-content">
        <TripsGrid :mobility-id="uuid" :preview="isPreview" />
      </div>
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
  width: 100%;
  padding: 2rem;
  box-sizing: border-box;
  overflow: hidden;
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
