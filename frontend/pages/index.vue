<template>
  <div class="page">
    <div class="background-gradient"></div>
    <HeroSection />
    <MobiliteReinventeeSection />
    <EnjeuxSection />
    <SolutionSection />
>>>>>>> 54ae9af03bff9cf9f55e56069e5ae27ab6ff4fd2
  </div>
</template>

<script setup>
import HeroSection from "../components/landing/HeroSection.vue";
import EnjeuxSection from "../components/landing/EnjeuxSection.vue";
import SolutionSection from "../components/landing/SolutionSection.vue";
import MobiliteReinventeeSection from "../components/MobiliteReinventee.vue";

useHead({
  title: "Accueil",
});
</script>

<style scoped>
/* Background */
.background-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* primary, background, secondary */
  background: radial-gradient(
    circle at top right,
    oklch(70.62% 0.139 158.37 / 0.3),
    oklch(98.02% 0.011 167.81 / 0.3),
    oklch(80.58% 0.058 231.66 / 0.3)
  );
  z-index: -10;
}

/* Page & Sections */
.page {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 5rem;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  gap: 10rem;
}

h1 {
  font-family: var(--font-ubuntu);
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 1rem;
}

p {
  color: var(--text);
  opacity: 0.7;
  font-size: 1.1rem;
}
</style>
