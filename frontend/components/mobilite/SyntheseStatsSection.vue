<script setup>
import {
  Timer,
  Ruler,
  Leaf,
  MapPin,
  SquareKanban,
  FileDown,
  ChevronDown,
} from "lucide-vue-next";
import { exportMobility } from "~/utils/mobility_api";
import { ref } from "vue";

const props = defineProps({
  stats: {
    type: Object,
    default: () => ({}),
  },
  mobilityId: {
    type: String,
    default: "",
  },
});

const formatValue = (value) =>
  Number(value ?? 0).toLocaleString("fr-FR", {
    maximumFractionDigits: 2,
  });

const isDownloading = ref(false);
const isDropdownOpen = ref(false);

const options = [
  { label: "PDF", value: "pdf" },
  { label: "CSV", value: "csv" },
  { label: "JSON", value: "json" },
];

const handleDownload = async (mode) => {
  isDownloading.value = true;
  isDropdownOpen.value = false;
  try {
    if (!props.mobilityId) {
      throw new Error("Identifiant de mobilite manquant pour l'export CSV");
    }

    const rawData = await exportMobility(props.mobilityId, mode);

    let blob;
    if (mode === "json") {
      blob = new Blob([JSON.stringify(rawData, null, 2)], {
        type: "application/json",
      });
    } else {
      blob = rawData instanceof Blob ? rawData : new Blob([rawData]);
    }

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Synthese_Mobilite_${props.mobilityId}.${mode}`,
    );

    document.body.appendChild(link);
    link.click();

    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    const message =
      error?.data?.message || error?.message || "Erreur lors de l'exportation.";
    alert(message);
  } finally {
    isDownloading.value = false;
  }
};
</script>

<template>
  <section class="synthese">
    <div class="overview-header">
      <div class="overview-title">
        <SquareKanban class="icon" size="var(--font-section-title)" />
        <h2 class="section-title gradient-cta">Statistiques</h2>
      </div>
      <div class="dropdown-container">
        <button
          class="btn"
          @click="isDropdownOpen = !isDropdownOpen"
          :disabled="isDownloading"
        >
          <FileDown class="icon" size="20" color="var(--background)" />
          <p class="body">
            {{ isDownloading ? "Generation..." : "Exporter" }}
          </p>
          <ChevronDown
            size="20"
            color="var(--background)"
            class="chevron"
            :class="{ open: isDropdownOpen }"
          />
        </button>
        <div v-if="isDropdownOpen" class="dropdown-menu">
          <button
            v-for="option in options"
            :key="option.value"
            class="dropdown-item"
            @click="handleDownload(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </div>

    <div class="stats-cards">
      <div class="stat-card reveal-on-scroll delay-2">
        <div class="title-row">
          <Leaf class="icon" size="25" />
          <h3 class="subtitle gradient-cta">Emissions</h3>
        </div>
        <p class="body">{{ formatValue(props.stats?.totalCarbon) }} kg CO2</p>
      </div>

      <div class="stat-card reveal-on-scroll delay-4">
        <div class="title-row">
          <MapPin class="icon" size="25" />
          <h3 class="subtitle gradient-cta">Etapes</h3>
        </div>
        <p class="body">{{ formatValue(props.stats?.stepCount) }}</p>
      </div>

      <div class="stat-card reveal-on-scroll delay-6">
        <div class="title-row">
          <Ruler class="icon" size="25" />
          <h3 class="subtitle gradient-cta">Distance</h3>
        </div>
        <p class="body">{{ formatValue(props.stats?.totalDistance) }} km</p>
      </div>

      <div class="stat-card reveal-on-scroll delay-8">
        <div class="title-row">
          <Timer class="icon" size="25" />
          <h3 class="subtitle gradient-cta">Temps</h3>
        </div>
        <p class="body">{{ formatValue(props.stats?.totalTime ?? 0) }}</p>
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
  cursor: pointer;

  transition: all 0.3s ease-in-out;
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    transform: translateY(-3px);
  }
}

.dropdown-container {
  position: relative;
  display: inline-block;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  min-width: 120px;
  overflow: hidden;
  z-index: 100;
}

.dropdown-item {
  padding: 0.75rem 1.5rem;
  border: none;
  background: transparent;
  text-align: left;
  font-size: var(--font-body);
  color: var(--text-dark);
  cursor: pointer;
  transition: background 0.2s ease;
}

.dropdown-item:hover {
  background: var(--background);
}

.chevron {
  transition: transform 0.3s ease;
}
.chevron.open {
  transform: rotate(180deg);
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
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
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
