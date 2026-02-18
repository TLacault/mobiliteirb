<template>
  <div class="section-mobilite">
    <div class="content-wrapper">
      <!-- Zone texte -->
      <div class="text-zone">
        <div class="title-row">
          <Leaf :size="34" color="var(--primary)" />
          <h1>Votre Mobilité Réinventée</h1>
        </div>

        <p>
          Dédiée aux étudiants de <strong>l’Enseirb</strong>, cette plateforme
          vous permet de <strong>planifier vos déplacements</strong> lors de
          votre mobilité à l’étranger. Une interface intuitive pensée pour votre
          vie étudiante. Rejoignez une <strong>communauté engagée</strong> pour
          une mobilité plus <strong>fluide</strong>,
          <strong>économique</strong> et <strong>responsable</strong>.
        </p>
      </div>

      <!-- Zone image -->
      <div class="image-zone">
        <img
          src="/images/mobilite_illustration.png"
          alt="Illustration mobilité"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { Leaf } from "lucide-vue-next";

useHead({
  title: "MobiliteSection",
});
</script>

<style scoped>
.section-mobilite {
  display: flex;
  justify-content: center;
}

.content-wrapper {
  max-width: 1200px;
  display: flex;
  align-items: center;
  gap: 60px;
  flex-wrap: wrap;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.title-row h1 {
  font-family: var(--font-ubuntu);
  font-size: 2.4rem;
  font-weight: 700;
  background: linear-gradient(to right, var(--primary), oklch(55% 0.12 160));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin: 0;
}

.text-zone {
  flex: 1;
}

.image-zone {
  flex: 1;
  display: flex;
  justify-content: center;
}

.text-zone p {
  font-size: 1.1rem;
  color: var(--text);
  opacity: 0.85;
  margin-bottom: 12px;
}

.image-zone img {
  width: 100%;
  max-width: 700px;
  object-fit: contain;
}
</style>
