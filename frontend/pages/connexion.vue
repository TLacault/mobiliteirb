<template>
  <div class="page">
    <div class="container">
      <h1>Connexion</h1>

      <!-- Section de connexion -->
      <div v-if="!isAuthenticated" class="login-section">
        <p class="description">
          Connectez-vous avec votre compte ENSEIRB-MATMECA pour accéder à
          l'application
        </p>

        <button @click="handleLogin" class="login-button">
          <span class="button-icon">🔐</span>
          <span class="button-text">Se connecter avec EirbConnect</span>
        </button>

        <p class="info-text">
          Vous serez redirigé vers la page d'authentification sécurisée de
          l'ENSEIRB
        </p>
      </div>

      <!-- Section utilisateur connecté -->
      <div v-else class="user-section">
        <h2>Bienvenue !</h2>

        <div class="user-card">
          <div class="user-info">
            <div class="info-row">
              <span class="label">Nom complet :</span>
              <span class="value"
                >{{ user?.given_name }} {{ user?.family_name }}</span
              >
            </div>

            <div class="info-row" v-if="user?.email">
              <span class="label">Email :</span>
              <span class="value">{{ user?.email }}</span>
            </div>

            <div class="info-row" v-if="user?.preferred_username">
              <span class="label">Nom d'utilisateur :</span>
              <span class="value">{{ user?.preferred_username }}</span>
            </div>

            <div class="info-row" v-if="user?.ecole">
              <span class="label">École :</span>
              <span class="value">{{ user?.ecole }}</span>
            </div>

            <div class="info-row" v-if="user?.diplome">
              <span class="label">Diplôme :</span>
              <span class="value">{{ user?.diplome }}</span>
            </div>
          </div>

          <button @click="handleLogout" class="logout-button">
            Se déconnecter
          </button>
        </div>

        <div class="actions">
          <NuxtLink to="/dashboard" class="action-button primary">
            Accéder au Dashboard
          </NuxtLink>
          <NuxtLink to="/" class="action-button secondary">
            Retour à l'accueil
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { user, isAuthenticated, login, logout, checkAuth } = useAuth();

useHead({
  title: "Connexion",
});

// Vérifier si l'utilisateur est déjà connecté au montage du composant
onMounted(async () => {
  // Nettoyer l'état en cas d'erreur d'authentification
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("error")) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  }
  await checkAuth();
});

const handleLogin = () => {
  login();
};

const handleLogout = () => {
  logout();
};
</script>

<style scoped>
.page {
  min-height: calc(100vh - 73px);
  padding: 3rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 2rem;
}

h1 {
  font-family: var(--font-ubuntu);
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 2rem;
  text-align: center;
}

/* Section de connexion */
.login-section {
  background: white;
  border-radius: 16px;
  padding: 3rem 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.description {
  color: var(--text);
  font-size: 1.1rem;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.login-button {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.login-button:active {
  transform: translateY(0);
}

.button-icon {
  font-size: 1.5rem;
}

.button-text {
  font-family: var(--font-ubuntu);
}

.info-text {
  color: var(--text);
  opacity: 0.6;
  font-size: 0.9rem;
  margin-top: 1.5rem;
  font-style: italic;
}

/* Section utilisateur connecté */
.user-section {
  background: white;
  border-radius: 16px;
  padding: 3rem 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

h2 {
  font-family: var(--font-ubuntu);
  font-size: 2rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 2rem;
  text-align: center;
}

.user-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: var(--text);
  font-size: 0.95rem;
}

.value {
  color: var(--text);
  font-size: 1rem;
  text-align: right;
}

.logout-button {
  width: 100%;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.logout-button:hover {
  background: #c0392b;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.action-button {
  display: block;
  text-align: center;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
}

.action-button.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.action-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.action-button.secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.action-button.secondary:hover {
  background: #667eea;
  color: white;
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }

  h1 {
    font-size: 2rem;
  }

  .login-section,
  .user-section {
    padding: 2rem 1.5rem;
  }

  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .value {
    text-align: left;
  }
}
</style>
