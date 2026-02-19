<script setup>
import {
  Trash2,
  Briefcase,
  Leaf,
  Timer,
  MapPin,
  PencilRuler,
} from "lucide-vue-next";
</script>

<template>
  <div class="card-container">
    <!-- Boutton-->
    <div class="trash-button"><Trash2 color="red" /></div>
    <div class="card-title">
      <!-- Récup nom de la mobilité -->
      <div class="icon"><Briefcase color="var(--primary)" /></div>
      <p>blablabla</p>
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
        <p>4 étape</p>
      </div>
    </div>

    <div class="traject-section">
      <!-- Récup départ -->
      <div class="departure-point etape"><p>Bordeaux</p></div>
      <div class="arrow"></div>
      <!-- Récup arrivée -->
      <div class="destination-point etape"><p>Paris</p></div>
    </div>

    <div class="footer-section">
      <div class="modifier-section">
        <!--Faire une boutton-->
        <div class="icon"><PencilRuler /></div>
        <p>Modifier</p>
      </div>
      <!-- Récup date de modification -->
      <div class="date-modification"><p>9/11/2004</p></div>
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

  color: var(--text);
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

.arrow {
  width: 30px;
  height: 2px;
  background-color: var(--text);
  position: relative;
}

.arrow::after {
  content: "";
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid var(--text);
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
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
  color: var(--text);
}
</style>
