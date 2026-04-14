<script setup>
import { ref, reactive, watch } from "vue";
import { Briefcase, CloudCheck } from "lucide-vue-next";

const open = defineModel({ type: Boolean, default: false });

const form = reactive({
  mobilite: "",
  annee: "",
  depart: "",
  arrivee: "",
  visibilite: true,
});

const formRef = ref(null);
const submitted = ref(false);
const formValid = ref(true);

const resetForm = () => {
  form.mobilite = "";
  form.annee = "";
  form.depart = "";
  form.arrivee = "";
  form.visibilite = true;
  submitted.value = false;
  formValid.value = true;
};

watch(open, (newVal) => {
  if (!newVal) resetForm();
});

// Re-evaluate validity live after first submit attempt
watch(
  form,
  () => {
    if (submitted.value) {
      formValid.value = formRef.value?.checkValidity() ?? true;
    }
  },
  { deep: true },
);

const emit = defineEmits(["submit"]);

const submit = () => {
  submitted.value = true;
  formValid.value = formRef.value.checkValidity();
  if (formValid.value) {
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

    <form
      ref="formRef"
      class="popup-body popup-form"
      :class="{ submitted }"
      novalidate
      @submit.prevent
    >
      <div class="popup-field">
        <label class="popup-label" data-required for="pm-mobilite">
          Nommez votre mobilité
        </label>
        <input
          id="pm-mobilite"
          class="popup-input"
          type="text"
          placeholder="Stage 3A - New York"
          v-model="form.mobilite"
          required
        />
      </div>

      <div class="popup-field">
        <label class="popup-label" data-required for="pm-annee">
          Année de la mobilité
        </label>
        <input
          id="pm-annee"
          class="popup-input no-spinner"
          type="number"
          placeholder="2026"
          min="2000"
          max="2100"
          v-model="form.annee"
          required
        />
      </div>

      <div class="popup-field">
        <label class="popup-label" data-required for="pm-depart">
          Point de départ
        </label>
        <PlaceAutocompleteInput
          v-model="form.depart"
          placeholder="Bordeaux"
          class="popup-input"
          required
        />
      </div>

      <div class="popup-field">
        <label class="popup-label" data-required for="pm-arrivee">
          Point d'arrivée
        </label>
        <PlaceAutocompleteInput
          v-model="form.arrivee"
          placeholder="New York"
          class="popup-input"
          required
        />
      </div>

      <span v-if="!formValid" class="popup-form-error">
        Veuillez remplir tous les champs obligatoires (marqués d'un *).
      </span>

      <div class="popup-divider" />

      <div class="popup-toggle-row">
        <div class="popup-toggle-label">
          <span>Visible par tous</span>
          <small>
            Votre mobilité apparaitra dans les recherches pour aider les autres
            étudiants. Vous pouvez activer l'anonymisation dans la gestion de
            votre projet.
          </small>
        </div>
        <label class="popup-toggle">
          <input type="checkbox" v-model="form.visibilite" />
          <span class="popup-toggle-track"></span>
        </label>
      </div>
    </form>

    <div class="popup-actions">
      <button class="popup-btn popup-btn-primary" @click="submit">
        <CloudCheck size="15" /> Créer la mobilité
      </button>
    </div>
  </PopupWrapper>
</template>
