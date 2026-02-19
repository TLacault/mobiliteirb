<template>
  <div class="page">
    <div class="container">
      <div class="welcome-section">
        <h1>Dashboard</h1>
        <p class="welcome-message" v-if="user">
          Bonjour,
          <strong>{{ user.given_name }} {{ user.family_name }}</strong> 👋
        </p>
      </div>

      <div class="dashboard-content">
        <p>Start building your dashboard components here</p>

        <!-- Exemple de carte d'information utilisateur -->
        <div class="info-card" v-if="user">
          <h3>Vos informations</h3>
          <ul>
            <li><strong>Email :</strong> {{ user.email }}</li>
            <li><strong>Username :</strong> {{ user.preferred_username }}</li>
            <li v-if="user.ecole"><strong>École :</strong> {{ user.ecole }}</li>
            <li v-if="user.diplome">
              <strong>Diplôme :</strong> {{ user.diplome }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Protéger cette page avec le middleware d'authentification
definePageMeta({
  middleware: "auth",
});

const { user } = useAuth();

useHead({
  title: "Dashboard",
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

.welcome-section {
  margin-bottom: 3rem;
}

h1 {
  font-family: var(--font-ubuntu);
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 1rem;
}

.welcome-message {
  color: var(--text);
  font-size: 1.3rem;
}

.welcome-message strong {
  color: #667eea;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.dashboard-content > p {
  color: var(--text);
  opacity: 0.7;
  font-size: 1.1rem;
}

.info-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  max-width: 600px;
}

.info-card h3 {
  font-family: var(--font-ubuntu);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 1.5rem;
}

.info-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-card li {
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  color: var(--text);
}

.info-card li:last-child {
  border-bottom: none;
}

.info-card li strong {
  color: #667eea;
  margin-right: 0.5rem;
}
</style>
