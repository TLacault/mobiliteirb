<template>
  <PopupWrapper v-model="open" title="Nouvelle mobilité">
    <template #icon>
      <PlaneTakeoff size="20" />
    </template>

    <form
      ref="formRef"
      class="popup-body popup-form"
      :class="{ submitted }"
      novalidate
      @submit.prevent
    >
      <div class="popup-field">
        <label class="popup-label" data-required for="pm-destination"
          >Destination</label
        >
        <input
          id="pm-destination"
          class="popup-input"
          type="text"
          placeholder="ex. Berlin, Allemagne"
          v-model="form.destination"
          required
        />
      </div>

      <div class="popup-field">
        <label class="popup-label" data-optional for="pm-university"
          >Université d'accueil</label
        >
        <input
          id="pm-university"
          class="popup-input"
          type="text"
          placeholder="ex. TU Berlin"
          v-model="form.university"
        />
      </div>

      <div class="popup-field">
        <label class="popup-label" data-optional for="pm-duration"
          >Durée (mois)</label
        >
        <input
          id="pm-duration"
          class="popup-input"
          type="number"
          min="1"
          max="24"
          placeholder="6"
          v-model="form.duration"
        />
      </div>

      <span v-if="!formValid" class="popup-form-error">
        Veuillez remplir tous les champs obligatoires (marqués d'un *).
      </span>

      <div class="popup-divider" />

      <div class="popup-toggle-row">
        <div class="popup-toggle-label">
          <span>Mobilité Erasmus+</span>
          <small>Financement européen applicable</small>
        </div>
        <label class="popup-toggle">
          <input type="checkbox" v-model="form.erasmus" />
          <span class="popup-toggle-track"></span>
        </label>
      </div>
    </form>

    <div class="popup-actions">
      <button class="popup-btn popup-btn-secondary" @click="open = false">
        Annuler
      </button>
      <button class="popup-btn popup-btn-primary" @click="submit">
        <Save size="15" /> Enregistrer
      </button>
    </div>
  </PopupWrapper>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { PlaneTakeoff, Save } from "lucide-vue-next";

const open = defineModel({ type: Boolean, default: false });

const form = reactive({
  destination: "",
  university: "",
  duration: "",
  erasmus: false,
});

const formRef = ref(null);
const submitted = ref(false);
const formValid = ref(true);

watch(open, (newVal) => {
  if (!newVal) {
    submitted.value = false;
    formValid.value = true;
  }
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
