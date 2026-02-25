<template>
  <div class="page">
    <div class="container">
      <!-- Section de connexion -->
      <div v-if="!isAuthenticated" class="login-section">
        <p class="description">
          Utilisez votre compte <strong>CAS</strong> ou vos identifiants
          <strong>EirbConnect</strong> pour accéder à l'application
        </p>

        <button @click="handleLogin" class="login-button">
          <UserKey class="button-icon" size="30" />
          <p>Se connecter avec <strong>EirbConnect</strong></p>
        </button>

        <p class="info-text">
          Vous serez redirigé vers la page d'authentification.
        </p>
      </div>

      <!-- Section utilisateur connecté -->
      <div v-else class="user-section">
        <div class="user-space">
          <CircleUserRound size="35" color="var(--primary)" />
          <h2 class="section-title">Mon Espace</h2>
        </div>

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
            <LogOut class="button-icon" size="20" />
            <p>Se déconnecter</p>
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
import { UserKey, CircleUserRound, LogOut } from "lucide-vue-next";

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
  background: var(--radialPrimarySecondary);
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
  background: var(--gradientCallToAction);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem 2rem;
  font-size: 1.1rem;
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

.user-space {
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
  gap: 1rem;
  margin-bottom: 2rem;

  & h2 {
    color: var(--primary);
    font-family: var(--font-ubuntu);
    font-size: 2rem;
  }
}

.user-card {
  background: rgba(0, 0, 0, 0.1);
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  width: 100%;
  background: var(--danger);
  color: white;
  border-radius: 100px;
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;

  transition: all 0.3s ease-in-out;
  &:hover {
    box-shadow: 0 4px 15px rgba(209, 47, 47, 0.4);
  }
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
  transition: all 0.3s ease-in-out;
}

.action-button.primary {
  background: var(--gradientCallToAction);
  color: white;
  box-shadow: 0 4px 15px oklch(43.15% 0.073 199.96 / 0.3);

  &:hover {
    /* transform: translateY(-2px); */
    box-shadow: 0 6px 20px oklch(43.15% 0.073 199.96 / 0.5);
  }
}

.action-button.secondary {
  background: white;
  color: var(--primary);
  border: 2px solid var(--primary);

  transition: all 0.3s ease-in-out;
  &:hover {
    background: var(--primary);
    color: white;
  }
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
