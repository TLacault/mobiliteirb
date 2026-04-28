<script setup>
import {
  ArrowLeft,
  Trash2,
  FileText,
  Route,
  CheckCheck,
  HatGlasses,
  FilePen,
  User,
  PlaneTakeoff,
  PlaneLanding,
  TicketsPlane,
  CalendarDays,
} from "lucide-vue-next";
import PopupDelete from "../popup/PopupDelete.vue";
import PopupAuthor from "../popup/PopupAuthor.vue";
import {
  deleteMobility,
  updateMobility,
  duplicateMobility,
} from "../../utils/mobility_api.js";

const { notify } = useNotification();

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

const { clearMobilite, setLastTab, setPreviewMode, isPreview } =
  useMobiliteSession();
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
const localAnonymous = ref(Boolean(props.mobility?.isAnonymous));
const localStartLocation = ref(props.mobility?.startLocation ?? "");
const localEndLocation = ref(props.mobility?.endLocation ?? "");

const authorLabel = computed(
  () => props.mobility?.author?.casLogin ?? "Anonyme",
);
const authorEmail = computed(() => props.mobility?.author?.email ?? null);
const isAnonymousAuthor = computed(
  () =>
    !props.mobility?.author?.casLogin ||
    props.mobility.author.casLogin === "Anonyme",
);

const showAuthorPopup = ref(false);
const badgeRef = ref(null);
const anchorRect = ref(null);

function openAuthorPopup() {
  if (isAnonymousAuthor.value) return;
  if (badgeRef.value) {
    const rect = badgeRef.value.getBoundingClientRect();
    anchorRect.value = {
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      right: rect.right,
    };
  }
  showAuthorPopup.value = true;
}

// Last committed values — used to skip saves when nothing changed
const committedName = ref(localName.value);
const committedYear = ref(localYear.value);
const committedAnonymous = ref(localAnonymous.value);
const committedStartLocation = ref(localStartLocation.value);
const committedEndLocation = ref(localEndLocation.value);

// Synchronise si la prop change (premier chargement différé)
watch(
  () => props.mobility,
  (m) => {
    if (m) {
      localName.value = m.name ?? "";
      committedName.value = localName.value;
      localYear.value = m.year ? new Date(m.year).getFullYear() : "";
      committedYear.value = localYear.value;
      localAnonymous.value = Boolean(m.isAnonymous);
      committedAnonymous.value = localAnonymous.value;
      localStartLocation.value = m.startLocation ?? "";
      committedStartLocation.value = localStartLocation.value;
      localEndLocation.value = m.endLocation ?? "";
      committedEndLocation.value = localEndLocation.value;
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
  if (field === "anonymous")
    return localAnonymous.value !== committedAnonymous.value;
  if (field === "startLocation")
    return (
      localStartLocation.value.trim() !== committedStartLocation.value.trim()
    );
  if (field === "endLocation")
    return localEndLocation.value.trim() !== committedEndLocation.value.trim();
  return false;
};

const saveField = async (field, inputEl = null) => {
  if (!props.mobility) return;
  clearTimeout(debounceTimers[field]);
  // Apply trim in-place before any comparison or save
  if (field === "name") localName.value = localName.value.trim();
  if (field === "startLocation")
    localStartLocation.value = localStartLocation.value.trim();
  if (field === "endLocation")
    localEndLocation.value = localEndLocation.value.trim();
  if (inputEl) inputEl.blur();
  if (!isDirty(field)) return;
  const payload = {};
  if (field === "name") payload.name = localName.value;
  if (field === "year" && localYear.value)
    payload.year = `${localYear.value}-01-01`;
  if (field === "anonymous") payload.isAnonymous = localAnonymous.value;
  if (field === "startLocation")
    payload.startLocation = localStartLocation.value;
  if (field === "endLocation") payload.endLocation = localEndLocation.value;
  if (!Object.keys(payload).length) return;
  try {
    await updateMobility(props.uuid, payload);
    // Commit the new values
    if (field === "name") committedName.value = localName.value;
    if (field === "year") committedYear.value = localYear.value;
    if (field === "anonymous") committedAnonymous.value = localAnonymous.value;
    if (field === "startLocation")
      committedStartLocation.value = localStartLocation.value;
    if (field === "endLocation")
      committedEndLocation.value = localEndLocation.value;
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
    notify("success", "Mobilité supprimée avec succès.");
    navigateTo("/dashboard");
  } catch (e) {
    console.error("Erreur suppression mobilité:", e);
  }
};

const handleDuplicate = async () => {
  try {
    const { id: newUuid } = await duplicateMobility(props.uuid);
    setPreviewMode(false);
    notify("success", "Mobilité importée avec succès dans votre espace.");
    navigateTo(`/mobilite/${newUuid}/synthese`);
  } catch (e) {
    if (e?.response?.status === 429) {
      notify(
        "error",
        e.response._data?.error || "Limite de mobilités atteinte.",
      );
    } else {
      console.error("Erreur confirmation import mobilité:", e);
    }
  }
};

function handleStartLocationSelect() {
  saveField("startLocation");
}

function handleEndLocationSelect() {
  saveField("endLocation");
}
</script>

<template>
  <header class="mobilite-header">
    <!-- Row 1 : (nom, année) | (départ, arrivée) | (badge étudiant / toggle anonyme) -->
    <div class="header-row1">
      <div class="row1-container">
        <div class="identity-fields">
          <div class="identity-field-wrap">
            <TicketsPlane size="20" class="identity-icon" />
            <div class="field-wrap">
              <Transition name="badge">
                <span
                  v-if="savedField === 'name'"
                  class="saved-badge badge-left"
                >
                  <CheckCheck size="13" />
                  saved
                </span>
              </Transition>
              <input
                v-model="localName"
                class="field-input field-name"
                placeholder="Nom de la mobilité"
                :disabled="isPreview"
                @input="scheduleSave('name')"
                @blur="saveField('name')"
                @keydown.enter.prevent="(e) => saveField('name', e.target)"
              />
            </div>
          </div>
          <div class="identity-field-wrap">
            <CalendarDays size="20" class="identity-icon" />
            <div class="field-wrap">
              <input
                v-model="localYear"
                class="field-input field-year"
                placeholder="Année"
                type="number"
                min="2000"
                max="2100"
                :disabled="isPreview"
                @input="scheduleSave('year')"
                @blur="saveField('year')"
                @keydown.enter.prevent="(e) => saveField('year', e.target)"
              />
              <Transition name="badge">
                <span
                  v-if="savedField === 'year'"
                  class="saved-badge badge-right"
                >
                  <CheckCheck size="13" color="var(--primary)" />
                  saved
                </span>
              </Transition>
            </div>
          </div>
        </div>

        <div class="location-fields">
          <div class="location-field-wrap">
            <PlaneTakeoff size="20" class="location-icon" />
            <PlaceAutocompleteInput
              v-model="localStartLocation"
              class="field-input field-location"
              placeholder="Ville de départ"
              :disabled="isPreview"
              @select="handleStartLocationSelect"
            />
            <Transition name="badge">
              <span
                v-if="savedField === 'startLocation'"
                class="saved-badge badge-right"
              >
                <CheckCheck size="13" color="var(--primary)" />
                saved
              </span>
            </Transition>
          </div>
          <div class="location-field-wrap">
            <PlaneLanding size="20" class="location-icon" />
            <PlaceAutocompleteInput
              v-model="localEndLocation"
              class="field-input field-location"
              placeholder="Ville d'arrivée"
              :disabled="isPreview"
              @select="handleEndLocationSelect"
            />
            <Transition name="badge">
              <span
                v-if="savedField === 'endLocation'"
                class="saved-badge badge-right"
              >
                <CheckCheck size="13" color="var(--primary)" />
                saved
              </span>
            </Transition>
          </div>
        </div>

        <div class="row1-right">
          <span
            v-if="isPreview"
            ref="badgeRef"
            class="header-author-badge"
            :class="{
              anonymous: isAnonymousAuthor,
              clickable: !isAnonymousAuthor,
            }"
            @click.stop="openAuthorPopup"
          >
            <User :size="15" />{{ authorLabel }}
          </span>
          <PopupAuthor
            v-if="isPreview"
            :show="showAuthorPopup"
            :cas-login="authorLabel"
            :email="authorEmail"
            :anchor-rect="anchorRect"
            @close="showAuthorPopup = false"
          />
          <label
            v-if="!isPreview"
            class="anonymous-toggle"
            title="Mode anonyme"
          >
            <span class="anonymous-label">
              <HatGlasses size="13" />
              <span class="anonymous-text"> Anonyme </span>
            </span>
            <input
              v-model="localAnonymous"
              type="checkbox"
              @change="saveField('anonymous')"
            />
            <span class="anonymous-track"></span>
          </label>
        </div>
      </div>
    </div>

    <!-- Row 2 : (retour) | (synthèse, trajets) | (supprimer / dupliquer) -->
    <div class="header-row2">
      <div class="row2-container">
        <button class="back-btn" @click="goBack">
          <ArrowLeft size="18" />
          <span>Retour</span>
        </button>

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

        <div class="row2-right">
          <button
            v-if="!isPreview"
            class="delete-btn"
            @click="showDeletePopup = true"
          >
            <Trash2 size="16" />
            <span>Supprimer</span>
          </button>
          <button
            v-if="isPreview && mobility"
            class="duplicate-btn"
            @click="handleDuplicate"
          >
            <FilePen size="16" color="var(--background)" />
            <span>Dupliquer</span>
          </button>
        </div>
      </div>
    </div>

    <PopupDelete v-model="showDeletePopup" @confirm="handleDelete" />
  </header>
</template>

<style scoped>
/* --- Row 1 --- */
.header-row1 {
  padding: 0.85rem 0;
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.row1-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
}

.identity-fields {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-shrink: 0;
}

.identity-field-wrap {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.identity-icon {
  color: var(--primary);
  flex-shrink: 0;
}

.location-fields {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex: 500px;
  min-width: 0;
}

.location-field-wrap {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex: 1;
  min-width: 0;
}

.location-icon {
  color: var(--primary);
  flex-shrink: 0;
}

.row1-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
  margin-left: auto;
}

/* --- Row 2 --- */
.header-row2 {
  padding: 0.65rem 0;
  background: transparent;
}

.row2-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.row2-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: auto;
}

/* --- Shared field styles --- */
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
  color: var(--primary);
  background: #dcfce7;
  padding: 0.2rem 0.55rem;
  border-radius: 100px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 10;
  border: 1.5px solid var(--primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

  &:disabled {
    opacity: 0.7;
    cursor: default;
  }
}

.field-name {
  width: 300px;
  font-weight: 600;
}

.field-year {
  width: 90px;
}

:deep(.field-location) {
  width: 100%;
  border: 1.5px solid transparent;
  border-radius: 8px;
  padding: 0.4rem 0.75rem;
  font-size: 0.88rem;
  font-family: inherit;
  background: #f8f9fa;
  color: var(--text);
  transition: border-color 0.2s, background 0.2s;
  outline: none;
}

:deep(.field-location:focus) {
  border-color: var(--primary);
  background: white;
}

:deep(.field-location:disabled) {
  opacity: 0.7;
  cursor: default;
}

/* --- Anonymous toggle --- */
.anonymous-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  user-select: none;
}

.anonymous-toggle input {
  display: none;
}

.anonymous-label {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.anonymous-track {
  width: 36px;
  height: 20px;
  border-radius: 100px;
  background: #d1d5db;
  position: relative;
  transition: background-color 0.2s ease;
}

.anonymous-track::after {
  content: "";
  position: absolute;
  top: 3px;
  left: 3px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #ffffff;
  transition: transform 0.2s ease;
}

.anonymous-toggle input:checked + .anonymous-track {
  background: var(--primary);
}

.anonymous-toggle input:checked + .anonymous-track::after {
  transform: translateX(16px);
}

/* --- Buttons --- */
.back-btn {
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

.duplicate-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.75rem 0.9rem;
  border: none;
  background: var(--gradientCallToAction);
  color: white;
  line-height: 1;
  border-radius: 100px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s ease-in-out;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    transform: translateY(-2px);
  }
}

.delete-btn {
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

/* --- Tabs --- */
.header-tabs {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.tab-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: clamp(200px, 25vw, 400px);
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

/* --- Author badge --- */
.header-author-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
  background: oklch(70.62% 0.139 158.37 / 15%);
  color: var(--primary);

  &.clickable {
    cursor: pointer;
    outline: 1px solid var(--primary);
    transition: background 0.15s ease;

    &:hover {
      background: oklch(70.62% 0.139 158.37 / 25%);
    }
  }

  &.anonymous {
    background: #f1f5f9;
    color: #94a3b8;
    cursor: default;
  }
}

/* --- Responsive --- */
@media (max-width: 1100px) {
  .row1-container {
    flex-wrap: wrap;
  }

  .field-name {
    width: 180px;
  }

  .tab-btn {
    width: 240px;
  }
}

@media (max-width: 1024px) {
  .row1-container,
  .row2-container {
    padding: 0 1rem;
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .identity-fields,
  .location-fields {
    flex-direction: column;
    gap: 0.75rem;
  }

  .field-name,
  .field-year {
    width: 100%;
  }

  .row1-right {
    width: 100%;
    margin-left: 0;
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .row2-right {
    margin-left: 0;
    justify-content: flex-end;
  }

  .header-tabs {
    width: 100%;
  }

  .tab-btn {
    flex: 1;
    width: auto;
  }
}

@media (max-width: 640px) {
  .header-tabs {
    flex-direction: column;
  }

  .tab-btn {
    width: 100%;
    flex: none;
  }

  .row2-container {
    flex-direction: column;
    align-items: stretch;
  }

  .back-btn {
    align-self: flex-start;
  }

  .row2-right {
    justify-content: flex-start;
  }
}
</style>
