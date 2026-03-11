<script setup>
import {
  ArrowLeft,
  Trash2,
  FileText,
  Route,
  CheckCheck,
} from "lucide-vue-next";
import PopupDelete from "../popup/PopupDelete.vue";
import { deleteMobility, updateMobility } from "../../utils/mobiliteAPI.js";

const props = defineProps({
  uuid: {
    type: String,
    required: true,
  },
  mobility: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["deleted", "updated"]);

const { clearMobilite, setLastTab } = useMobiliteSession();
const route = useRoute();

// Onglet actif détecté depuis l'URL
const activeTab = computed(() =>
  route.path.endsWith("/trajets") ? "trajets" : "synthese",
);

// Champs éditables locaux (initialisés depuis les props)
const localName = ref(props.mobility?.name ?? "");
const localYear = ref(
  props.mobility?.year ? new Date(props.mobility.year).getFullYear() : "",
);

// Last committed values — used to skip saves when nothing changed
const committedName = ref(localName.value);
const committedYear = ref(localYear.value);

// Synchronise si la prop change (premier chargement différé)
watch(
  () => props.mobility,
  (m) => {
    if (m) {
      localName.value = m.name ?? "";
      committedName.value = localName.value;
      localYear.value = m.year ? new Date(m.year).getFullYear() : "";
      committedYear.value = localYear.value;
    }
  },
);

// Flash-green state per field
const savedField = ref(null);
let savedTimer = null;

const flashSaved = (field) => {
  savedField.value = field;
  clearTimeout(savedTimer);
  savedTimer = setTimeout(() => {
    savedField.value = null;
  }, 2000);
};

// Debounce timers per field
const debounceTimers = {};

const isDirty = (field) => {
  if (field === "name")
    return localName.value.trim() !== committedName.value.trim();
  if (field === "year")
    return (
      String(localYear.value).trim() !== String(committedYear.value).trim()
    );
  return false;
};

const saveField = async (field, inputEl = null) => {
  if (!props.mobility) return;
  clearTimeout(debounceTimers[field]);
  // Apply trim in-place before any comparison or save
  if (field === "name") localName.value = localName.value.trim();
  if (inputEl) inputEl.blur();
  if (!isDirty(field)) return;
  const payload = {};
  if (field === "name") payload.name = localName.value;
  if (field === "year" && localYear.value)
    payload.year = `${localYear.value}-01-01`;
  if (!Object.keys(payload).length) return;
  try {
    await updateMobility(props.uuid, payload);
    // Commit the new values
    if (field === "name") committedName.value = localName.value;
    if (field === "year") committedYear.value = localYear.value;
    emit("updated", payload);
    flashSaved(field);
  } catch (e) {
    console.error("Erreur mise à jour mobilité:", e);
  }
};

// Schedule a save after 1 s of inactivity
const scheduleSave = (field) => {
  clearTimeout(debounceTimers[field]);
  debounceTimers[field] = setTimeout(() => saveField(field), 1000);
};

// Navigation
const goBack = () => {
  clearMobilite();
  navigateTo("/dashboard");
};

const goToTab = (tab) => {
  setLastTab(props.uuid, tab);
  navigateTo(`/mobilite/${props.uuid}/${tab}`);
};

// Suppression
const showDeletePopup = ref(false);

const handleDelete = async () => {
  try {
    await deleteMobility(props.uuid);
    clearMobilite();
    emit("deleted");
    navigateTo("/dashboard");
  } catch (e) {
    console.error("Erreur suppression mobilité:", e);
  }
};
</script>

<template>
  <header class="mobilite-header">
    <!-- Niveau 1 : navigation + champs + suppression -->
    <div class="header-top">
      <div class="header-container">
        <button class="back-btn" @click="goBack">
          <ArrowLeft size="18" />
          <span>Retour</span>
        </button>

        <div class="mobility-fields">
          <div class="field-wrap">
            <Transition name="badge">
              <span v-if="savedField === 'name'" class="saved-badge badge-left">
                <CheckCheck size="13" />
                saved
              </span>
            </Transition>
            <input
              v-model="localName"
              class="field-input field-name"
              placeholder="Nom de la mobilité"
              @input="scheduleSave('name')"
              @blur="saveField('name')"
              @keydown.enter.prevent="(e) => saveField('name', e.target)"
            />
          </div>
          <div class="field-wrap">
            <input
              v-model="localYear"
              class="field-input field-year"
              placeholder="Année"
              type="number"
              min="2000"
              max="2100"
              @input="scheduleSave('year')"
              @blur="saveField('year')"
              @keydown.enter.prevent="(e) => saveField('year', e.target)"
            />
            <Transition name="badge">
              <span
                v-if="savedField === 'year'"
                class="saved-badge badge-right"
              >
                <CheckCheck size="13" />
                saved
              </span>
            </Transition>
          </div>
        </div>

        <button class="delete-btn" @click="showDeletePopup = true">
          <Trash2 size="16" />
          <span>Supprimer</span>
        </button>
      </div>
    </div>

    <!-- Niveau 2 : onglets -->
    <div class="header-tabs-wrapper">
      <nav class="header-tabs">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'synthese' }"
          @click="goToTab('synthese')"
        >
          <FileText size="16" />
          Synthèse
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'trajets' }"
          @click="goToTab('trajets')"
        >
          <Route size="16" />
          Trajets
        </button>
      </nav>
    </div>

    <PopupDelete v-model="showDeletePopup" @confirm="handleDelete" />
  </header>
</template>

<style scoped>
.mobilite-header {
  /* pas de background ici : chaque niveau gère le sien */
}

/* --- Container commun (limite la largeur) --- */
.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* --- Niveau 1 --- */
.header-top {
  padding: 0.85rem 0;
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.header-container {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1rem;
}

.back-btn {
  justify-self: start;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: none;
  border: 1.5px solid var(--primary);
  color: var(--primary);
  padding: 0.4rem 0.9rem;
  border-radius: 100px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: var(--primary);
    color: white;
  }
}

.mobility-fields {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  justify-content: center;
}

.field-wrap {
  position: relative;
}

.saved-badge {
  position: absolute;
  top: calc(100% + 6px);
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #16a34a;
  background: #dcfce7;
  padding: 0.2rem 0.55rem;
  border-radius: 100px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 10;
}

.badge-left {
  left: 0;
}

.badge-right {
  right: 0;
}

.badge-enter-active,
.badge-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.badge-enter-from,
.badge-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.field-input {
  border: 1.5px solid transparent;
  border-radius: 8px;
  padding: 0.4rem 0.75rem;
  font-size: 1rem;
  font-family: inherit;
  background: #f8f9fa;
  color: var(--text);
  transition: border-color 0.2s, background 0.2s;
  outline: none;

  &:focus {
    border-color: var(--primary);
    background: white;
  }
}

.field-name {
  width: 500px;
  font-weight: 600;
}

.field-year {
  width: 90px;
}

.delete-btn {
  justify-self: end;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: none;
  border: 1.5px solid #ef4444;
  color: #ef4444;
  padding: 0.4rem 0.9rem;
  border-radius: 100px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: #ef4444;
    color: white;
  }
}

/* --- Niveau 2 : onglets --- */
.header-tabs-wrapper {
  padding: 0.75rem 2rem;
  background: transparent;
}

.header-tabs {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.tab-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 400px;
  background: none;
  border: 1.5px solid #e5e7eb;
  border-radius: 100px;
  padding: 0.55rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--primary);
    color: var(--primary);
  }

  &.active {
    background: var(--primary);
    border-color: var(--primary);
    color: white;
    font-weight: 600;
  }
}
</style>
