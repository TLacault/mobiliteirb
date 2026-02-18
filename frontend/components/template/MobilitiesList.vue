<template>
  <div class="mobilities-list">
    <h2>Mes Mobilités (Client-Side)</h2>

    <!-- État de chargement -->
    <div v-if="loading" class="loading">Chargement des mobilités...</div>

    <!-- Gestion des erreurs -->
    <div v-else-if="error" class="error">
      <p>❌ Erreur lors du chargement : {{ error }}</p>
      <button @click="loadData">Réessayer</button>
    </div>

    <!-- Liste des mobilités -->
    <div
      v-else-if="mobilities && mobilities.length > 0"
      class="mobilities-grid"
    >
      <div
        v-for="mobility in mobilities"
        :key="mobility.id"
        class="mobility-card"
      >
        <h3>{{ mobility.name }}</h3>
        <div class="mobility-info">
          <p><strong>De :</strong> {{ mobility.startLocation }}</p>
          <p><strong>À :</strong> {{ mobility.endLocation }}</p>
          <p>
            <strong>Année :</strong> {{ new Date(mobility.year).getFullYear() }}
          </p>
          <p>
            <strong>Visibilité :</strong>
            {{ mobility.isPublic ? "Public" : "Privé" }}
          </p>
        </div>

        <!-- Informations sur l'utilisateur -->
        <div v-if="mobility.user" class="user-info">
          <p>
            <small>👤 {{ mobility.user.casLogin }}</small>
          </p>
        </div>

        <!-- Nombre de trajets -->
        <div v-if="mobility.trips" class="trips-count">
          <p>🚗 {{ mobility.trips.length }} trajet(s)</p>
        </div>

        <!-- Actions -->
        <div class="actions">
          <button @click="viewDetails(mobility.id)">Voir détails</button>
          <button @click="handleDelete(mobility.id)" class="delete-btn">
            Supprimer
          </button>
        </div>
      </div>
    </div>

    <!-- Aucune mobilité trouvée -->
    <div v-else class="empty">
      <p>Aucune mobilité trouvée.</p>
    </div>
  </div>
</template>

<script setup>
// URL de l'API en dur pour éviter les problèmes de config
const API_BASE = "http://localhost:3000/api/v1";

const mobilities = ref([]);
const loading = ref(false);
const error = ref(null);

/**
 * Charge les mobilités depuis l'API
 */
const loadData = async () => {
  loading.value = true;
  error.value = null;

  try {
    console.log("🔧 Fetching from:", `${API_BASE}/mobilites`);
    mobilities.value = await $fetch(`${API_BASE}/mobilites`);
    console.log("✅ Mobilities loaded:", mobilities.value.length);
  } catch (e) {
    console.error("❌ Error loading mobilities:", e);
    error.value = e.message || "Erreur lors du chargement";
  } finally {
    loading.value = false;
  }
};

/**
 * Supprime une mobilité
 */
const handleDelete = async (id) => {
  if (!confirm("Êtes-vous sûr de vouloir supprimer cette mobilité ?")) {
    return;
  }

  try {
    await $fetch(`${API_BASE}/mobilites/${id}`, {
      method: "DELETE",
    });
    // Recharger la liste
    await loadData();
  } catch (e) {
    alert("Erreur lors de la suppression : " + e.message);
  }
};

/**
 * Navigation vers les détails
 */
const viewDetails = (id) => {
  navigateTo(`/mobilites/${id}`);
};

// Charger les données uniquement côté client
onMounted(() => {
  loadData();
});
</script>

<style scoped>
.mobilities-list {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 2rem;
  font-size: 2rem;
}

.loading,
.error,
.empty {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
}

.error {
  color: #d32f2f;
}

.error button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #d32f2f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.mobilities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.mobility-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.mobility-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.mobility-card h3 {
  margin-bottom: 1rem;
  font-size: 1.3rem;
  color: #333;
}

.mobility-info p {
  margin: 0.5rem 0;
  color: #666;
}

.user-info {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.trips-count {
  margin-top: 0.5rem;
  color: #1976d2;
  font-weight: 500;
}

.actions {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
}

.actions button {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: opacity 0.2s;
}

.actions button:first-child {
  background: #1976d2;
  color: white;
}

.delete-btn {
  background: #d32f2f !important;
  color: white !important;
}

.actions button:hover {
  opacity: 0.8;
}
</style>
