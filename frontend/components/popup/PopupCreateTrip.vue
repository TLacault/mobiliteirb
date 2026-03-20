<script setup>
import { ref, watch } from "vue";
import { Route } from "lucide-vue-next";
import PopupWrapper from "./PopupWrapper.vue";

const open = defineModel({ type: Boolean, default: false });
const emit = defineEmits(["submit"]);

const name = ref("");

watch(open, (isOpen) => {
  if (isOpen) {
    name.value = "";
  }
});

function submit() {
  if (name.value.trim()) {
    emit("submit", name.value.trim());
    open.value = false;
  }
}
</script>

<template>
  <PopupWrapper v-model="open" title="Nouveau trajet">
    <template #icon>
      <Route size="20" />
    </template>

    <form class="popup-body popup-form" @submit.prevent="submit">
      <div class="popup-field">
        <label class="popup-label" data-required for="trip-name"
          >Nom du trajet</label
        >
        <input
          id="trip-name"
          class="popup-input"
          type="text"
          placeholder="Ex: Trajet Aller, Retour via train..."
          v-model="name"
          required
          autofocus
        />
      </div>
    </form>

    <div class="popup-actions">
      <button class="popup-btn popup-btn-secondary" @click="open = false">
        Annuler
      </button>
      <button
        class="popup-btn popup-btn-primary"
        @click="submit"
        :disabled="!name.trim()"
      >
        Créer
      </button>
    </div>
  </PopupWrapper>
</template>
