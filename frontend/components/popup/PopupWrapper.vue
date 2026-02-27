<template>
  <Teleport to="body">
    <Transition name="popup-fade">
      <div
        v-if="modelValue"
        class="popup-backdrop"
        @mousedown.self="$emit('update:modelValue', false)"
      >
        <Transition name="popup-slide" appear>
          <div v-if="modelValue" class="popup" role="dialog" aria-modal="true">
            <!-- Header -->
            <div class="popup-header">
              <div class="popup-icon" :class="iconVariant">
                <slot name="icon" />
              </div>
              <h2 class="popup-title">{{ title }}</h2>
              <button
                class="popup-close"
                @click="$emit('update:modelValue', false)"
                aria-label="Fermer"
              >
                <X size="18" />
              </button>
            </div>

            <!-- Content -->
            <slot />
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { X } from "lucide-vue-next";

defineProps({
  modelValue: { type: Boolean, required: true },
  title: { type: String, required: true },
  iconVariant: { type: String, default: "" }, // "", "danger", "warning"
});

defineEmits(["update:modelValue"]);
</script>
