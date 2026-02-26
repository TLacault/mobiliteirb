<script setup>
import { Lightbulb, ArrowUpRight } from "lucide-vue-next";
</script>

<template>
  <div class="ImporterSection">
    <div class="info">
      <div class="title-row">
        <Lightbulb class="icon" />
        <h3 class="section-title">
          Importez des mobilités des autres étudiants
        </h3>
      </div>
      <p class="detail">
        Peut-être qu'un autre étudiant a déjà effectué une mobilité vers votre
        destination
      </p>
    </div>

    <div class="bouton">
      <NuxtLink to="recherche" class="btn">
        Rechercher
        <ArrowUpRight />
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ImporterSection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 1.5rem;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  background: var(--gradientCallToAction);
  color: white;
  padding: 0.7rem 1.4rem;
  border-radius: 32px;
  font-size: var(--font-body);
  text-decoration: none;
  cursor: pointer;
}

.icon {
  color: var(--primary);
  width: 30px;
  height: 30px;
}

.info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
}
</style>
