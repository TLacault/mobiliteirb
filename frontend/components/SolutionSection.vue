<template>
  <section class="solution-section">
    <div class="solution-container">
      <div class="columns">
        <div class="left-column">
          <div class="title-container">
            <Puzzle :size="34" color="var(--primary)" />
            <span class="logo-text">La Solution</span>
          </div>
          <p>
            <span class="bold">MobilitEirb</span>
            calcule instantanément l'impact carbone de vos itinéraires pour vous
            aider à privilégier les
            <span class="bold">options douces</span>. Visualisez vos
            <span class="bold">économies de CO2</span>
            en temps réel et adoptez sans effort des habitudes durables comme le
            covoiturage ou les transports en commun. Prenez le contrôle de votre
            <span class="bold">empreinte écologique</span>
            au quotidien sans sacrifier votre temps de trajet.
          </p>
        </div>
        <div class="right-column">
          <img
            src="/images/example_trajet.png"
            alt="La Solution image"
            class="solution-img"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { Puzzle } from "lucide-vue-next";

useHead({
  title: "La Solution",
});
</script>

<style scoped>
.solution-section {
  background: linear-gradient(to top, #f0fdfa, #e6f7f4);
  padding: 3rem 0;
}

.solution-container {
  max-width: 1175px;
  margin: 0 auto;
  padding: 0 2rem;
}

.columns {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.left-column {
  flex: 1;
}

.title-container {
  display: flex;
  gap: 15px;
  margin-bottom: 1rem;
}

.logo-text {
  background: linear-gradient(to right, var(--primary), oklch(50% 0.12 160));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

p {
  color: var(--text);
  text-align: justify;
  font-size: 1.1rem;
}

.bold {
  font-weight: bold;
}

.right-column {
  flex: 1;
}

.solution-img {
  display: block;
  margin: 3rem auto 0 3rem;
  width: 450px;
  max-width: 90%;
  height: auto;
}

@media (max-width: 900px) {
  .columns {
    flex-direction: column;
    align-items: center;
  }

  .solution-img {
    margin: 0 auto;
  }
}
</style>
