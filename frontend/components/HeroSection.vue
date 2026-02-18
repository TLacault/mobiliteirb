<template>
  <div class="section-hero">
    <!-- Logo Section -->
    <div class="logo-hero">
      <img src="/images/logo.png" alt="MobilitEirb Logo" class="logo-image" />
      <span class="logo-text">Mobilit'<span class="green">Eirb</span></span>
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
  background: linear-gradient(to bottom, transparent, var(--background));
}

.section-hero::before {
  content: "";
  position: absolute;
  top: 1rem;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url(../public/images/minimalist_earth.png);
  background-repeat: no-repeat;
  background-position: center top;
  background-size: 90%;
  opacity: 0.3;
  z-index: -1;
}

.logo-hero {
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
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
  padding: 0.6rem 1.5rem;
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

.more-info {
  padding: 3.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
}

.more-arrow {
  padding: 0.5rem 0.25rem;
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
