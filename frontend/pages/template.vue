<template>
  <div class="page">
    <div class="container">
      <h1>Template</h1>
      <p>Quelques exemples de composants & Icons</p>

      <!-- Icon Examples -->
      <section class="section">
        <h2>Icon Examples (Lucide)</h2>
        <div class="icon-grid">
          <div>
            <Home />
            <span>Home</span>
          </div>

          <div>
            <Search :size="64" />
            <span>Search</span>
          </div>

          <div>
            <User :size="32" color="var(--primary)" />
            <span>User</span>
          </div>

          <div>
            <Settings :size="32" color="var(--primary)" strokeWidth="3" />
            <span>Settings</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { Home, Search, User, Settings } from "lucide-vue-next";

useHead({
  title: "Template",
});
</script>

<style scoped>
.page {
  min-height: calc(100vh - 73px);
  padding: 3rem 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

h1 {
  font-family: var(--font-ubuntu);
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 0.5rem;
}

h2 {
  font-family: var(--font-ubuntu);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 1.5rem;
}

p {
  color: var(--text);
  opacity: 0.7;
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

/* ICONS */

.icon-grid {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}
</style>
