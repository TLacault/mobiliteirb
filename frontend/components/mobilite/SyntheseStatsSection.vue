<script setup>
import { Timer, Ruler, Leaf, MapPin, Eye, FileDown } from "lucide-vue-next";

defineProps({
  stats: {
    type: Object,
    default: () => ({}),
  },
});

const formatValue = (value) =>
  Number(value ?? 0).toLocaleString("fr-FR", {
    maximumFractionDigits: 2,
  });
</script>

<template>
  <section class="synthese">
    <div class="overview-header">
      <div class="overview-title">
        <Eye class="icon" size="25" />
        <h2 class="title">Overview</h2>
      </div>

      <button type="button" class="btn">
        <FileDown class="icon" size="25" />
        <p class="body">Generer PDF</p>
      </button>
    </div>

    <div class="stats-cards">
      <div class="stat-card">
        <div class="title-row">
          <Leaf class="icon" size="25" />
          <h3 class="subtitle">Emissions</h3>
        </div>
        <p class="body">{{ formatValue(stats?.totalCarbon) }} kg CO2</p>
      </div>

      <div class="stat-card">
        <div class="title-row">
          <MapPin class="icon" size="25" />
          <h3 class="subtitle">Etapes</h3>
        </div>
        <p class="body">{{ formatValue(stats?.stepCount) }}</p>
      </div>

      <div class="stat-card">
        <div class="title-row">
          <Ruler class="icon" size="25" />
          <h3 class="subtitle">Distance</h3>
        </div>
        <p class="body">{{ formatValue(stats?.totalDistance) }} km</p>
      </div>

      <div class="stat-card">
        <div class="title-row">
          <Timer class="icon" size="25" />
          <h3 class="subtitle">Temps</h3>
        </div>
        <p class="body">{{ formatValue(stats?.totalTime ?? 0) }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.synthese {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.overview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.overview-title {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.9rem;
  border: none;
  background: var(--gradientCallToAction);
  color: white;
  line-height: 1;
}

.btn .icon {
  color: white;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  width: 100%;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.4rem;
  width: 100%;
  min-width: 0;
  border: 1px solid var(--primary);
  border-radius: 14px;
  padding: 0.5rem 1.5rem;
  font-size: var(--font-body);
  background: white;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color:var(--primary);
}

.stat-card .subtitle {
  color: var(--primary);
}

.icon {
  color: var(--primary);
}

</style>
