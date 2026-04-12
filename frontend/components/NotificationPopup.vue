<script setup>
import { computed } from "vue";
import { Info, AlertTriangle, XCircle, CheckCircle, X } from "lucide-vue-next";
import { useNotification } from "~/composables/useNotification";

const { current, dismiss } = useNotification();

const iconMap = {
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
  success: CheckCircle,
};

const currentIcon = computed(() =>
  current.value ? iconMap[current.value.type] : null,
);
</script>

<template>
  <Teleport to="body">
    <Transition name="notif-slide">
      <div v-if="current" :key="current.id" class="notif" :class="current.type">
        <component :is="currentIcon" :size="20" class="notif-icon" />
        <span class="notif-text">{{ current.message }}</span>
        <button class="notif-close" @click="dismiss">
          <X :size="16" />
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.notif {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 10000;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.85rem 1.15rem;
  border-radius: 12px;
  min-width: 280px;
  max-width: 420px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.14);
  font-size: 0.88rem;
  font-weight: 500;
  line-height: 1.35;
  pointer-events: auto;
}

/* Variants */
.notif.success {
  background: #ecfdf5;
  border: 1.5px solid #6ee7b7;
  color: #065f46;
}

.notif.error {
  background: #fef2f2;
  border: 1.5px solid #fca5a5;
  color: #991b1b;
}

.notif.warning {
  background: #fffbeb;
  border: 1.5px solid #fcd34d;
  color: #92400e;
}

.notif.info {
  background: #eff6ff;
  border: 1.5px solid #93c5fd;
  color: #1e40af;
}

.notif-icon {
  flex-shrink: 0;
}

.notif-text {
  flex: 1;
  min-width: 0;
}

.notif-close {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  opacity: 0.55;
  padding: 0.15rem;
  border-radius: 6px;
  transition: opacity 0.15s ease, background 0.15s ease;
}

.notif-close:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.06);
}

/* Slide animation */
.notif-slide-enter-active {
  transition: opacity 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.notif-slide-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.notif-slide-enter-from {
  opacity: 0;
  transform: translateX(100%) translateY(-10px);
}

.notif-slide-leave-to {
  opacity: 0;
  transform: translateX(100%) translateY(-10px);
}
</style>
