<template>
  <div class="page">
    <div class="container">
      <h1 class="page-title">Composants Popup</h1>
      <p class="page-subtitle">
        Exemples des différents types de popup utilisés dans l'application.
        Cliquez sur un bouton pour ouvrir le popup correspondant.
      </p>

      <div class="examples-grid">
        <!-- Formulaire -->
        <div class="example-card">
          <div class="example-header">
            <div class="example-badge form">Formulaire</div>
          </div>
          <h2 class="example-title">Créer une mobilité</h2>
          <p class="example-desc">
            Popup avec champs texte, champ numérique et toggle. Utilisé pour
            collecter des informations.
          </p>
          <button class="example-btn" @click="showForm = true">
            <PlaneTakeoff size="16" /> Nouvelle mobilité
          </button>
        </div>

        <!-- Confirmation -->
        <div class="example-card">
          <div class="example-header">
            <div class="example-badge confirm">Confirmation</div>
          </div>
          <h2 class="example-title">Confirmer une action</h2>
          <p class="example-desc">
            Popup de confirmation avant d'effectuer une opération importante ou
            irréversible.
          </p>
          <button class="example-btn" @click="showConfirm = true">
            <ShieldCheck size="16" /> Valider le dépôt
          </button>
        </div>

        <!-- Suppression -->
        <div class="example-card">
          <div class="example-header">
            <div class="example-badge danger">Suppression</div>
          </div>
          <h2 class="example-title">Supprimer un élément</h2>
          <p class="example-desc">
            Popup de confirmation de suppression avec avertissement. L'action
            est irréversible.
          </p>
          <button class="example-btn danger" @click="showDelete = true">
            <Trash2 size="16" /> Supprimer la mobilité
          </button>
        </div>
      </div>

      <!-- Log des actions -->
      <div class="log-section" v-if="log.length > 0">
        <h3 class="log-title">Journal des actions</h3>
        <ul class="log-list">
          <li v-for="(entry, i) in log" :key="i" class="log-entry">
            <span class="log-time">{{ entry.time }}</span>
            <span class="log-msg">{{ entry.msg }}</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Popups -->
    <PopupForm v-model="showForm" @submit="onFormSubmit" />
    <PopupConfirm
      v-model="showConfirm"
      message="Êtes-vous sûr de vouloir valider le dépôt de cette mobilité ? Elle sera soumise pour validation."
      @confirm="addLog('✅ Dépôt de mobilité confirmé.')"
    />
    <PopupDelete
      v-model="showDelete"
      item-name="Mobilité Berlin – TU Berlin (2025)"
      @confirm="addLog('🗑️ Mobilité supprimée.')"
    />
  </div>
</template>

<script setup>
import { PlaneTakeoff, ShieldCheck, Trash2 } from "lucide-vue-next";
import PopupForm from "../components/popup/PopupForm.vue";
import PopupConfirm from "../components/popup/PopupConfirm.vue";
import PopupDelete from "../components/popup/PopupDelete.vue";

useHead({ title: "Popups" });

const showForm = ref(false);
const showConfirm = ref(false);
const showDelete = ref(false);

const log = ref([]);

const addLog = (msg) => {
  const now = new Date().toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  log.value.unshift({ time: now, msg });
};

const onFormSubmit = (data) => {
  addLog(
    `📋 Mobilité créée : ${data.destination || "—"} · ${
      data.university || "—"
    } · ${data.duration || "—"} mois${data.erasmus ? " · Erasmus+" : ""}`,
  );
};
</script>

<style scoped>
.page {
  min-height: calc(100vh - 73px);
  padding: 4rem 2rem;
  background: var(--background);
}

.container {
  max-width: 960px;
  margin: 0 auto;
}

.page-title {
  font-family: var(--font-ubuntu);
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 0.75rem;
}

.page-subtitle {
  font-size: 1rem;
  color: var(--text);
  opacity: 0.65;
  max-width: 580px;
  line-height: 1.65;
  margin-bottom: 3rem;
}

/* Grid */
.examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.example-card {
  background: white;
  border: 1.5px solid rgba(0, 0, 0, 0.07);
  border-radius: 16px;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.example-header {
  display: flex;
}

.example-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.03em;
}

.example-badge.form {
  background: oklch(70.62% 0.139 158.37 / 0.12);
  color: var(--primary);
}

.example-badge.confirm {
  background: oklch(80.58% 0.058 231.66 / 0.18);
  color: var(--tertiary);
}

.example-badge.danger {
  background: oklch(63.066% 0.194 29.425 / 0.1);
  color: var(--danger);
}

.example-title {
  font-family: var(--font-ubuntu);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text);
}

.example-desc {
  font-size: 0.875rem;
  color: var(--text);
  opacity: 0.6;
  line-height: 1.55;
  flex: 1;
}

.example-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.65rem 1.25rem;
  border-radius: 100px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  background: var(--gradientCallToAction);
  color: white;
  box-shadow: 0 4px 14px oklch(43.15% 0.073 199.96 / 0.25);
  transition: all 0.2s ease;
  align-self: flex-start;
  margin-top: 0.25rem;
}

.example-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px oklch(43.15% 0.073 199.96 / 0.4);
}

.example-btn.danger {
  background: var(--danger);
  box-shadow: 0 4px 14px oklch(63.066% 0.194 29.425 / 0.25);
}

.example-btn.danger:hover {
  box-shadow: 0 6px 18px oklch(63.066% 0.194 29.425 / 0.4);
}

/* Log */
.log-section {
  background: white;
  border: 1.5px solid rgba(0, 0, 0, 0.07);
  border-radius: 16px;
  padding: 1.5rem;
}

.log-title {
  font-family: var(--font-ubuntu);
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 1rem;
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  list-style: none;
}

.log-entry {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.02);
}

.log-time {
  color: var(--text);
  opacity: 0.4;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.log-msg {
  color: var(--text);
}
</style>
