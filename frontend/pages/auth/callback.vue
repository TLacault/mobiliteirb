<template>
  <div class="callback-page">
    <div class="container">
      <div class="loading-card" v-if="isLoading">
        <div class="spinner"></div>
        <h2>Connexion en cours...</h2>
        <p>
          Veuillez patienter pendant que nous finalisons votre authentification
        </p>
      </div>

      <div class="error-card" v-if="error">
        <div class="error-icon"><XCircle size="64" color="#e74c3c" /></div>
        <h2>Erreur d'authentification</h2>
        <p class="error-message">{{ error }}</p>

        <button @click="retry" class="retry-button">
          Retour à la connexion
        </button>
      </div>

      <div class="success-card" v-if="success">
        <div class="success-icon">
          <CheckCircle size="64" color="#27ae60" />
        </div>
        <h2>Authentification réussie !</h2>
        <p>Redirection en cours...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { XCircle, CheckCircle } from "lucide-vue-next";
const route = useRoute();
const router = useRouter();
const { handleCallback } = useAuth();

const isLoading = ref(true);
const error = ref(null);
const success = ref(false);

useHead({
  title: "Authentification en cours...",
});

onMounted(async () => {
  try {
    // Récupérer le code et le state depuis l'URL
    const code = String(route.query.code || "");
    const state = String(route.query.state || "");
    const errorParam = String(route.query.error || "");

    // Vérifier s'il y a une erreur dans les paramètres
    if (errorParam) {
      throw new Error(`Erreur lors de l'authentification: ${errorParam}`);
    }

    // Vérifier que le code est présent
    if (!code) {
      throw new Error("Code d'autorisation manquant");
    }

    // Vérifier que le state est présent
    if (!state) {
      throw new Error("Paramètre state manquant");
    }

    // Traiter le callback OAuth
    await handleCallback(code, state);

    // Succès !
    success.value = true;
    isLoading.value = false;

    // Rediriger vers la page de connexion après 1.5 secondes
    setTimeout(() => {
      router.push("/connexion");
    }, 1500);
  } catch (err) {
    console.error("Callback error:", err);
    const errorMessage =
      err instanceof Error
        ? err.message
        : "Une erreur s'est produite lors de l'authentification";
    error.value = errorMessage;
    isLoading.value = false;
  }
});

const retry = () => {
  router.push("/connexion");
};
</script>

<style scoped>
.callback-page {
  min-height: calc(100vh - 73px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--radialPrimarySecondary);
  padding: 2rem;
}

.container {
  max-width: 500px;
  width: 100%;
}

.loading-card,
.error-card,
.success-card {
  background: white;
  border-radius: 16px;
  padding: 3rem 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  text-align: center;
}

/* Loading */
.spinner {
  width: 60px;
  height: 60px;
  margin: 0 auto 2rem;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

h2 {
  font-family: var(--font-ubuntu);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 1rem;
}

p {
  color: var(--text);
  opacity: 0.7;
  font-size: 1rem;
  line-height: 1.6;
}

/* Error */
.error-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.error-message {
  color: #e74c3c;
  font-weight: 600;
  margin-bottom: 2rem;
}

.error-help {
  background: #f8f9fa;
  border-left: 4px solid #667eea;
  padding: 1.5rem;
  margin: 1.5rem 0;
  text-align: left;
  border-radius: 4px;
}

.error-help h3 {
  font-family: var(--font-ubuntu);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 1rem;
}

.error-help p {
  opacity: 1;
  margin-bottom: 1rem;
}

.error-help ol {
  margin-left: 1.5rem;
  text-align: left;
}

.error-help li {
  color: var(--text);
  opacity: 0.9;
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

.error-help a {
  color: #667eea;
  text-decoration: underline;
  font-weight: 600;
}

.error-help a:hover {
  color: #764ba2;
}

.retry-button {
  background: var(--gradientCallToAction);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.retry-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

/* Success */
.success-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
  animation: scaleIn 0.5s ease-out;
}

@keyframes scaleIn {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .loading-card,
  .error-card,
  .success-card {
    padding: 2rem 1.5rem;
  }

  h2 {
    font-size: 1.5rem;
  }
}
</style>
