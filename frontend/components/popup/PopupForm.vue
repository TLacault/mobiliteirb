<template>
  <PopupWrapper v-model="open" title="Nouvelle mobilité">
    <template #icon>
      <PlaneTakeoff size="20" />
    </template>

    <div class="popup-body">
      <div class="popup-field">
        <label class="popup-label" for="pm-destination">Destination</label>
        <input
          id="pm-destination"
          class="popup-input"
          type="text"
          placeholder="ex. Berlin, Allemagne"
          v-model="form.destination"
        />
      </div>

      <div class="popup-field">
        <label class="popup-label" for="pm-university"
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
        <label class="popup-label" for="pm-duration">Durée (mois)</label>
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
    </div>

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
import { PlaneTakeoff, Save } from "lucide-vue-next";

const open = defineModel({ type: Boolean, default: false });

const form = reactive({
  destination: "",
  university: "",
  duration: "",
  erasmus: false,
});

const emit = defineEmits(["submit"]);

const submit = () => {
  emit("submit", { ...form });
  open.value = false;
};
</script>
