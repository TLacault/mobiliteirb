<script setup>
import { MapPlus } from "lucide-vue-next";
</script>

<template>
  <div class="card-container">
    <div class="card-title">
      <p>Démarrer un nouveau projet</p>
    </div>
    <!-- Popup -->
    <div class="new-mobility-button">
      <div class="icon"><MapPlus color="var(--background)" /></div>
      <p>Nouvelle mobilité</p>
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
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px dashed var(--primary);
  align-items: center;
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

.new-mobility-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background-color: var(--primary);
  color: var(--background);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease-in-out;

  &:hover {
    background-color: var(--tertiary);
  }
}
</style>
