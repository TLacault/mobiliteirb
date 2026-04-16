<template>
  <PopupWrapper v-model="open" :title="title" icon-variant="danger">
    <template #icon>
      <Trash2 size="20" />
    </template>

    <div class="popup-body">
      <p class="popup-text">
        Vous êtes sur le point de supprimer <strong>{{ itemName }}</strong
        >. Cette action est <strong>irréversible</strong> et toutes les données
        associées seront perdues.
      </p>
    </div>

    <div class="popup-actions">
      <button class="popup-btn popup-btn-secondary" @click="open = false">
        Annuler
      </button>
      <button class="popup-btn popup-btn-danger" @click="confirm">
        <Trash2 size="15" /> Supprimer
      </button>
    </div>
  </PopupWrapper>
</template>

<script setup>
import { Trash2 } from "lucide-vue-next";

const open = defineModel({ type: Boolean, default: false });

const props = defineProps({
  itemName: {
    type: String,
    default: "cet élément",
  },
  title: {
    type: String,
    default: "Supprimer la mobilité",
  },
});

const emit = defineEmits(["confirm"]);

const confirm = () => {
  emit("confirm");
  open.value = false;
};
</script>
