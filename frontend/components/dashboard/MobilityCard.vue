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

const props = defineProps({
  m: {
    type: Object,
    required: true,
  },
});

const mobility = computed(() => props.m);

const formattedDate = computed(() => {
  return new Date(mobility.value.lastEdit).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
});
</script>

<template>
  <div class="card-container">
    <!-- Boutton-->
    <div class="trash-button"><Trash2 color="red" /></div>
    <div class="card-title">
      <!-- Récup nom de la mobilité -->
      <div class="icon"><Briefcase color="var(--primary)" /></div>
      <p>{{ mobility.name }}</p>
    </div>
    <div class="stats-section">
      <div class="stat-section">
        <!-- Récup émissions de CO2 -->
        <div class="icon"><Leaf /></div>
        <p>2kg CO2</p>
      </div>
      <div class="stat-section">
        <!-- Récup durée -->
        <div class="icon"><Timer /></div>
        <p>15 min</p>
      </div>
      <div class="stat-section">
        <!-- Récup nb d'étapes -->
        <div class="icon"><MapPin /></div>
        <p>4 étapes</p>
      </div>
    </div>

    <div class="traject-section">
      <!-- Récup départ -->
      <div class="departure-point etape">
        <p>{{ mobility.startLocation }}</p>
      </div>
      <div class="route-visual">
        <div class="start-dot"></div>
        <div class="line"></div>
        <div class="arrow-head"></div>
      </div>
      <!-- Récup arrivée -->
      <div class="destination-point etape">
        <p>{{ mobility.endLocation }}</p>
      </div>
    </div>

    <div class="footer-section">
      <div class="modifier-section">
        <!--Faire une boutton-->
        <div class="icon"><PencilRuler /></div>
        <p>Modifier</p>
      </div>
      <!-- Récup date de modification -->
      <div class="date-modification">
        <div class="text">
          <div class="icon"><CalendarCheck2 size="12" /></div>
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
.card-container {
  flex-wrap: wrap;
  max-width: 500px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--primary);
  align-items: center;
}
.trash-button {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
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
  margin-top: 1rem;
  flex: 1;
}

.stat-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  color: #9ca3af;
}

.traject-section {
  display: flex;
  align-items: center;
  gap: 1rem;
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
  width: 8px;
  height: 8px;
  background-color: white;
  border: 2px solid currentColor;
  border-radius: 50%;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

/* La ligne horizontale */
.line {
  height: 4px;
  width: 60px;
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
  flex-shrink: 0;
}

.footer-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.modifier-section {
  display: flex;
  padding: 0.2rem 1rem;
  min-width: 120px;
  text-align: center;
  border-radius: 100px;
  color: white;
  background-color: var(--primary);
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  &:hover {
    background-color: var(--tertiary);
  }
}

.date-modification {
  color: #6b7280;
  font-size: 0.6rem;
  margin-top: 0.5rem;
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
