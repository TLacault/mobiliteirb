<template>
  <div class="section-hero constainer">
    <!-- Background World Map -->
    <div class="background-map">
      <img
        src="/images/world.webp"
        alt="World Map Background"
        class="map-image"
      />
    </div>

    <!-- Logo Section -->
    <div class="logo-hero">
      <img src="/images/logo.webp" alt="MobilitEirb Logo" class="logo-image" />
      <span class="logo-text">Mobilit<span class="green">Eirb</span></span>
    </div>

    <!-- Text Section -->
    <div class="text-hero">
      <p>Calculez les émissions CO2 de vos trajets rapidement.</p>
      <p>
        Partagez vos mobilités et inspirez-vous de celles des autres étudiants.
      </p>
    </div>

    <!-- Account/Connection Section -->
    <div class="account-hero">
      <NuxtLink to="/connexion" class="btn-connexion">
        <div class="btn-text">
          <User />
          <p>Se Connecter</p>
        </div>
        <p class="text-connexion">Réservé aux étudiants de l'Enseirb</p>
      </NuxtLink>
    </div>

    <!-- More information Section -->
    <div class="more-info">
      <p>En Savoir Plus</p>
      <div class="more-arrow"><MoveDown color="var(--background)" /></div>
    </div>
  </div>
</template>

<script setup>
import { User, MoveDown } from "lucide-vue-next";
</script>

<style scoped>
.section-hero {
  padding: 3rem 1rem;
  position: relative;
  min-height: 100vh;
}

/* Background Map */
.background-map {
  position: fixed;
  top: 70px;
  left: 50%;
  transform: translateX(-50%);
  width: 100dvw;
  height: 100dvh;
  overflow: hidden;
  opacity: 0.25;
  z-index: -1;
  filter: blur(3px);
}

.map-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Logo Section */
.logo-hero {
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 15vh;
}

.logo-image {
  height: 100px;
  width: auto;
}

.logo-text {
  font-family: var(--font-ubuntu);
  font-size: 3.98rem;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;

  & .green {
    color: var(--primary);
  }
}

/* Text Section */
.text-hero {
  padding: 1.5rem 1rem;
  font-family: var(--font-inter);
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--text);
  text-align: center;
}

.account-hero {
  padding: 2rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-connexion {
  padding: 0.5rem 2.5rem;
  background: var(--gradientCallToAction);
  color: white;
  text-decoration: none;
  border-radius: 6.25rem;
  font-weight: 500;
  transition: opacity 0.2s;
}

.btn-connexion:hover {
  opacity: 0.9;
}

.btn-text {
  display: flex;
  gap: 0.5rem;
  flex: 1;
  justify-content: center;
  font-size: 1rem;
}

.text-connexion {
  font-size: 0.875rem;
  opacity: 0.65;
}

/* Voir Plus */
.more-info {
  position: absolute;
  bottom: 7rem;
  left: 50%;
  transform: translateX(-50%);

  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
}

.more-arrow {
  padding: 0.7rem 0.25rem;
  background: var(--primary);
  border-radius: 1rem;
  opacity: 0.7;
  animation: translation 2s ease-in-out infinite;
}

@keyframes translation {
  0%,
  100% {
    translate: 0;
  }
  50% {
    translate: 0rem 0.5rem;
  }
}
</style>
