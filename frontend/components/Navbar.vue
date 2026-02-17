<template>
  <nav class="navbar">
    <div class="navbar-container">
      <!-- Logo Section -->
      <div class="navbar-logo">
        <img src="/images/logo.png" alt="MobilitEirb Logo" class="logo-image" />
        <span class="logo-text">Mobilit'<span class="green">Eirb</span></span>
      </div>

      <!-- Navigation Links -->
      <div class="navbar-links">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.path"
          :to="link.path"
          class="nav-link"
        >
          {{ link.name }}
        </NuxtLink>
      </div>

      <!-- Account/Connection Section -->
      <div class="navbar-account">
        <NuxtLink to="/connexion" class="btn-connexion"> Connexion </NuxtLink>
      </div>
    </div>
  </nav>
</template>

<script setup>
const navLinks = [
  { name: "Accueil", path: "/" },
  { name: "Dashboard", path: "/dashboard" },
  { name: "Recherche", path: "/recherche" },
];
</script>

<style scoped>
.navbar {
  background-color: var(--background);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.navbar-logo {
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

.navbar-links {
  display: flex;
  gap: 1rem;
  flex: 1;
  justify-content: center;
}

.nav-link {
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

.navbar-account {
  display: flex;
  align-items: center;
}

.btn-connexion {
  padding: 0.5rem 1.5rem;
  background-color: var(--primary);
  color: white;
  text-decoration: none;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: opacity 0.2s;
}

.btn-connexion:hover {
  opacity: 0.9;
}

@media (max-width: 768px) {
  .navbar-container {
    flex-wrap: wrap;
  }

  .navbar-links {
    order: 3;
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
