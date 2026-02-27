<script setup>
import { Lightbulb, Search } from "lucide-vue-next";
</script>

<template>
  <div class="ImporterSection">
    <div class="info">
      <div class="title-row">
        <Lightbulb class="icon" size="25" />
        <h3 class="subtitle">Importez des mobilités des autres étudiants</h3>
      </div>
      <p class="detail">
        Peut-être qu'un autre étudiant a déjà effectué une mobilité vers votre
        destination
      </p>
    </div>

    <NuxtLink to="recherche" class="btn">
      <p>Rechercher</p>
      <Search size="20" />
    </NuxtLink>
  </div>
</template>

<style scoped>
.ImporterSection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 1.5rem;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  background: var(--gradientCallToAction);
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 32px;
  font-size: var(--font-body);
  text-decoration: none;
  cursor: pointer;

  & p {
    font-weight: 500;
  }

  transition: all 0.3s ease-in-out;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
}

.icon {
  color: var(--primary);
}

.info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
}
</style>
