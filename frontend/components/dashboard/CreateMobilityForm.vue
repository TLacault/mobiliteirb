<script setup>
import { Briefcase, CloudCheck } from "lucide-vue-next";

const open = defineModel({ type: Boolean, default: false });

const form = reactive({
  mobilite: "",
  annee: "",
  depart: "",
  arrivee: "",
  visibilite: true,
});

const errors = reactive({
  mobilite: null,
  annee: null,
  depart: null,
  arrivee: null,
});

const isNumeric = (str) => {
  return /^\d+$/.test(str);
};

const validateForm = () => {
  let isValid = true;

  if (!form.mobilite.trim()) {
    errors.mobilite = "* Le nom de la mobilité est requis.";
    isValid = false;
  } else {
    errors.mobilite = null;
  }

  if (!form.annee) {
    errors.annee = "* L'année de la mobilité est requise.";
    isValid = false;
  } else if (!isNumeric(form.annee) || form.annee < 2000 || form.annee > 2100) {
    errors.annee = "* L'année doit être comprise entre 2000 et 2100.";
    isValid = false;
  } else {
    errors.annee = null;
  }

  if (!form.depart.trim()) {
    errors.depart = "* Le point de départ est requis.";
    isValid = false;
  } else {
    errors.depart = null;
  }

  if (!form.arrivee.trim()) {
    errors.arrivee = "* Le point d'arrivée est requis.";
    isValid = false;
  } else {
    errors.arrivee = null;
  }

  return isValid;
};

const resetForm = () => {
  form.mobilite = "";
  form.annee = "";
  form.depart = "";
  form.arrivee = "";
  form.visibilite = true;
};

const resetErrors = () => {
  errors.mobilite = null;
  errors.annee = null;
  errors.depart = null;
  errors.arrivee = null;
};

watch(open, (newVal) => {
  if (!newVal) {
    resetForm();
    resetErrors();
  }
});

const emit = defineEmits(["submit"]);

const submit = () => {
  if (validateForm()) {
    emit("submit", { ...form });
    open.value = false;
  }
};
</script>

<template>
  <PopupWrapper v-model="open" title="Créer une mobilité">
    <template #icon>
      <Briefcase size="25" />
    </template>

    <div class="popup-body">
      <div class="popup-field">
        <label class="popup-label" for="pm-mobilite"
          >Nommez votre mobilité</label
        >
        <input
          id="pm-mobilite"
          class="popup-input"
          :class="{ 'popup-input-error': errors.mobilite }"
          type="text"
          placeholder="Stage 3A - New York"
          v-model="form.mobilite"
          @input="errors.mobilite = null"
        />
        <span v-if="errors.mobilite" class="error-message">{{
          errors.mobilite
        }}</span>
      </div>

      <div class="popup-field">
        <label class="popup-label" for="pm-annee">Année de la mobilité</label>
        <input
          id="pm-annee"
          class="popup-input no-spinner"
          :class="{ 'popup-input-error': errors.annee }"
          type="text"
          inputmode="numeric"
          placeholder="2026"
          v-model="form.annee"
          @input="errors.annee = null"
        />
        <span v-if="errors.annee" class="error-message">{{
          errors.annee
        }}</span>
      </div>

      <div class="popup-field">
        <label class="popup-label" for="pm-depart">Point de départ</label>
        <input
          id="pm-depart"
          class="popup-input"
          :class="{ 'popup-input-error': errors.depart }"
          type="text"
          placeholder="Bordeaux"
          v-model="form.depart"
          @input="errors.depart = null"
        />
        <span v-if="errors.depart" class="error-message">{{
          errors.depart
        }}</span>
      </div>

      <div class="popup-field">
        <label class="popup-label" for="pm-arrivee">Point d'arrivée</label>
        <input
          id="pm-arrivee"
          class="popup-input"
          :class="{ 'popup-input-error': errors.arrivee }"
          type="text"
          placeholder="New York"
          v-model="form.arrivee"
          @input="errors.arrivee = null"
        />
        <span v-if="errors.arrivee" class="error-message">{{
          errors.arrivee
        }}</span>
      </div>

      <div class="popup-divider" />

      <div class="popup-toggle-row">
        <div class="popup-toggle-label">
          <span>Visible par tous</span>
          <small
            >Votre mobilité apparaitra dans les recherches pour aider les autres
            étudiants. Vous pouvez activer l'anonymisation dans la gestion de
            votre projet.</small
          >
        </div>
        <label class="popup-toggle">
          <input type="checkbox" v-model="form.visibilite" />
          <span class="popup-toggle-track"></span>
        </label>
      </div>
    </div>

    <div class="popup-actions">
      <button class="popup-btn popup-btn-primary" @click="submit">
        <CloudCheck size="15" /> Créer la mobilité
      </button>
    </div>
  </PopupWrapper>
</template>
