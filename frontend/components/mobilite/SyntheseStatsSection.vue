<script setup>
import {
  Timer,
  Ruler,
  Leaf,
  MapPin,
  SquareKanban,
  FileDown,
} from "lucide-vue-next";

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
        <SquareKanban class="icon" size="var(--font-section-title)" />
        <h2 class="section-title gradient-cta">Statistiques</h2>
      </div>

      <button class="btn">
        <FileDown class="icon" size="20" color="var(--background)" />
        <p class="body">Generer PDF</p>
      </button>
    </div>

    <div class="stats-cards">
      <div class="stat-card reveal-on-scroll delay-2">
        <div class="title-row">
          <Leaf class="icon" size="25" />
          <h3 class="subtitle gradient-cta">Emissions</h3>
        </div>
        <p class="body">{{ formatValue(stats?.totalCarbon) }} kg CO2</p>
      </div>

      <div class="stat-card reveal-on-scroll delay-4">
        <div class="title-row">
          <MapPin class="icon" size="25" />
          <h3 class="subtitle gradient-cta">Etapes</h3>
        </div>
        <p class="body">{{ formatValue(stats?.stepCount) }}</p>
      </div>

      <div class="stat-card reveal-on-scroll delay-6">
        <div class="title-row">
          <Ruler class="icon" size="25" />
          <h3 class="subtitle gradient-cta">Distance</h3>
        </div>
        <p class="body">{{ formatValue(stats?.totalDistance) }} km</p>
      </div>

      <div class="stat-card reveal-on-scroll delay-8">
        <div class="title-row">
          <Timer class="icon" size="25" />
          <h3 class="subtitle gradient-cta">Temps</h3>
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
  padding: 0.6rem 1.5rem;
  border: none;
  background: var(--gradientCallToAction);
  color: white;
  line-height: 1;
  border-radius: 100px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  transition: all 0.3s ease-in-out;
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    transform: translateY(-3px);
  }
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
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  min-width: 0;
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  padding-top: 1.5rem;
  font-size: var(--font-body);
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gradientCallToAction);
  border-radius: 16px 16px 0 0;
}

.stat-card:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.stat-card .body {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1a1a2e;
  letter-spacing: -0.01em;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary);

  & h3 {
    font-size: 1.5rem;
    font-weight: 600;
  }
}

.icon {
  color: var(--primary);
}
</style>
