<template>
  <PopupWrapper v-model="open" title="Confirmer l'action">
    <template #icon>
      <ShieldCheck size="20" />
    </template>

    <div class="popup-body">
      <p class="popup-text">
        {{ message }}
      </p>
    </div>

    <div class="popup-actions">
      <button class="popup-btn popup-btn-secondary" @click="open = false">
        Annuler
      </button>
      <button class="popup-btn popup-btn-primary" @click="confirm">
        <Check size="15" /> Confirmer
      </button>
    </div>
  </PopupWrapper>
</template>

<script setup>
import { ShieldCheck, Check } from "lucide-vue-next";

const open = defineModel({ type: Boolean, default: false });

const props = defineProps({
  message: {
    type: String,
    default: "Êtes-vous sûr de vouloir effectuer cette action ?",
  },
});

const emit = defineEmits(["confirm"]);

const confirm = () => {
  emit("confirm");
  open.value = false;
};
</script>
