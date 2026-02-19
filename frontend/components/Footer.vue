<script setup>
const navLinks = [
  { name: "Accueil", path: "/" },
  { name: "Dashboard", path: "/dashboard" },
  { name: "Recherche", path: "/recherche" },
];

import { Github, Copyright, Mail, MessagesSquare } from "lucide-vue-next";
</script>

<template>
  <footer class="footer">
    <UContainer class="footer-container">
      <!--Logo et titre -->
      <div class="footer-logo">
        <img
          src="/images/logo.webp"
          alt="MobilitEirb Logo"
          class="logo-image"
        />
        <span class="logo-text">Mobilit<span class="green">Eirb</span></span>
      </div>
      <!-- Description et crédits -->
      <div class="footer-content">
        <span class="detail">
          Outil pédagogique pour estimer les émissions de CO2 des déplacements
          internationaux d'élèves. Réalisé par les élèves de deuxième année
          d'informatique dans le cadre du projet de fin d'année à
          l'Enseirb-Matmeca. Facteurs d'émission basés sur les données de
          <a href="https://ecologie.gouv.fr">ecologie.gouv.fr</a>.
          <br />Résultats fournis à titre indicatif.
        </span>
      </div>

      <!-- Liens de navigation et icône GitHub -->
      <div class="icon-links">
        <a href="#" class="mail" target="_blank" rel="noopener">
          <Mail color="var(--background)" size="20" stroke-width="2" />
        </a>
        <a
          href="https://github.com/TLacault/mobiliteirb"
          class="github"
          target="_blank"
          rel="noopener"
        >
          <Github color="var(--background)" size="20" stroke-width="2" />
        </a>
        <a href="#" class="telegram" target="_blank" rel="noopener">
          <messagesSquare
            color="var(--background)"
            size="20"
            stroke-width="2"
          />
        </a>
      </div>

      <div class="footer-links">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.path"
          :to="link.path"
          class="footer-link"
        >
          {{ link.name }}
        </NuxtLink>
      </div>

      <div class="copyright-section">
        <Copyright size="16" />
        All rights reserved - MobilitEirb
        {{ new Date().getFullYear() }}
      </div>
    </UContainer>
  </footer>
</template>

<style scoped>
.footer {
  background: linear-gradient(
    to bottom,
    oklch(98.358% 0.0142 181.171 / 0.8),
    oklch(96.275% 0.01831 184.612 / 0.8),
    oklch(98.358% 0.0142 181.171 / 0.8)
  );
  padding: 2rem 0;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-image {
  height: 40px;
  width: auto;
}

.logo-text {
  font-family: var(--font-ubuntu);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;

  & .green {
    color: var(--primary);
  }
}

.footer-content {
  text-align: center;
  max-width: 800px;
  line-height: 1.8;

  & a {
    text-decoration: none;
    color: var(--primary);
    font-weight: bold;

    &:hover {
      text-decoration: underline;
    }
  }
}

.footer-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
}

.icon-links {
  display: flex;
  gap: 1rem;

  & a {
    background-color: var(--primary);
    padding: 0.6rem;
    border-radius: 100px;

    transition: all 0.3s ease-in-out;
    &:hover {
      background-color: var(--tertiary);
    }
  }
}

.footer-links {
  display: flex;
  gap: 1rem;
  flex: 1;
  justify-content: center;
}

.footer-link {
  padding: 0.5rem 1rem;
  color: var(--text);
  font-weight: 500;
  text-decoration: none;
  border-radius: 0.375rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
}

.copyright-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text);
  opacity: 0.7;
  font-size: 0.9rem;
}
</style>
