<template>
  <div class="section-mobilite">
    <div class="content-wrapper">
      <!-- Zone texte -->
      <div class="text-zone">
        <div class="title-container reveal-on-scroll reveal-right">
          <Leaf :size="40" color="var(--primary)" />
          <h1 class="section-title gradient-cta">Votre Mobilité Réinventée</h1>
        </div>

        <p class="body reveal-on-scroll reveal-up delay-1">
          Dédiée aux étudiants de l'<strong>Enseirb</strong>, cette plateforme
          vous permet de <strong>planifier vos déplacements</strong> lors de
          votre mobilité à l'étranger. Une interface intuitive pensée pour votre
          vie étudiante. Rejoignez une <strong>communauté engagée</strong> pour
          une mobilité plus <strong>fluide</strong>,
          <strong>économique</strong> et <strong>responsable</strong>.
        </p>
      </div>

      <!-- Zone image -->
      <div class="image-zone reveal-on-scroll reveal-left delay-2">
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
  padding: 0 2rem;
}

.content-wrapper {
  max-width: 1200px;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 60px;
  flex-wrap: wrap;
}

.title-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
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
  line-height: 1.8;
}

.image-zone img {
  width: 100%;
  max-width: 700px;
  object-fit: contain;
}

@media (max-width: 768px) {
  .section-mobilite {
    padding: 0 1.5rem;
  }

  .content-wrapper {
    flex-direction: column;
    gap: 2rem;
  }

  .text-zone,
  .image-zone {
    width: 100%;
    flex: none;
  }
}
</style>
