<template>
  <Teleport to="body">
    <Transition name="popauth-slide">
      <div
        v-if="show"
        ref="rootEl"
        class="popauth"
        :style="computedStyle"
        @click.stop
      >
        <!-- Header -->
        <div class="popauth-header">
          <div class="popauth-avatar">
            <User :size="22" />
          </div>
          <div class="popauth-identity">
            <span class="popauth-name">{{ casLogin }}</span>
            <span class="popauth-role">Étudiant</span>
          </div>
          <button
            class="popauth-close"
            aria-label="Fermer"
            @click="emit('close')"
          >
            <X :size="15" />
          </button>
        </div>

        <!-- Info -->
        <div class="popauth-body">
          <div class="popauth-row">
            <IdCard :size="14" class="popauth-icon" />
            <span class="popauth-label">CAS</span>
            <span class="popauth-value">{{ casLogin }}</span>
          </div>
          <div class="popauth-row">
            <School :size="14" class="popauth-icon" />
            <span class="popauth-label">École</span>
            <span class="popauth-value">ENSEIRB-MATMECA</span>
          </div>
          <div class="popauth-row">
            <GraduationCap :size="14" class="popauth-icon" />
            <span class="popauth-label">Diplôme</span>
            <span class="popauth-value">Ingénieur</span>
          </div>
        </div>

        <!-- Contact -->
        <div v-if="email" class="popauth-contact">
          <span class="popauth-contact-title">Contact</span>
          <div class="popauth-email-row">
            <Mail :size="13" class="popauth-icon" />
            <span class="popauth-email-text">{{ email }}</span>
            <button
              class="popauth-icon-btn"
              :title="copied ? 'Copié !' : 'Copier'"
              @click.stop="copyEmail"
            >
              <Check v-if="copied" :size="13" class="copied-icon" />
              <Copy v-else :size="13" />
            </button>
          </div>
          <a :href="`mailto:${email}`" class="popauth-mailto-btn" @click.stop>
            <Mail :size="14" />
            Contacter par e-mail
          </a>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted } from "vue";
import {
  User,
  X,
  IdCard,
  School,
  GraduationCap,
  Mail,
  Copy,
  Check,
} from "lucide-vue-next";

const props = defineProps({
  show: { type: Boolean, required: true },
  casLogin: { type: String, required: true },
  email: { type: String, default: null },
  anchorRect: { type: Object, default: null },
});

const emit = defineEmits(["close"]);

const rootEl = ref(null);
const copied = ref(false);
const computedStyle = ref({
  position: "fixed",
  top: "-9999px",
  left: "-9999px",
  zIndex: 9999,
});

const MARGIN = 8;

watch(
  () => props.show,
  async (val) => {
    if (!val) return;
    await nextTick();
    if (!rootEl.value || !props.anchorRect) return;

    const popupHeight = rootEl.value.offsetHeight;
    const popupWidth = rootEl.value.offsetWidth;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const { top, bottom, left } = props.anchorRect;

    let topPos;
    if (bottom + MARGIN + popupHeight <= vh) {
      topPos = bottom + MARGIN;
    } else {
      topPos = Math.max(MARGIN, top - MARGIN - popupHeight);
    }

    let leftPos = left;
    if (leftPos + popupWidth > vw - MARGIN) {
      leftPos = vw - popupWidth - MARGIN;
    }
    leftPos = Math.max(MARGIN, leftPos);

    computedStyle.value = {
      position: "fixed",
      top: `${topPos}px`,
      left: `${leftPos}px`,
      zIndex: 9999,
    };
  },
);

function handleOutsideClick(event) {
  if (!props.show) return;
  if (rootEl.value && !rootEl.value.contains(event.target)) {
    emit("close");
  }
}

function handleKeydown(event) {
  if (!props.show) return;
  if (event.key === "Escape") emit("close");
}

function handleScroll() {
  if (props.show) emit("close");
}

onMounted(() => {
  document.addEventListener("click", handleOutsideClick);
  document.addEventListener("keydown", handleKeydown);
  window.addEventListener("scroll", handleScroll, true);
});

onUnmounted(() => {
  document.removeEventListener("click", handleOutsideClick);
  document.removeEventListener("keydown", handleKeydown);
  window.removeEventListener("scroll", handleScroll, true);
});

async function copyEmail() {
  if (!props.email) return;
  try {
    await navigator.clipboard.writeText(props.email);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (e) {
    console.error("Erreur copie email:", e);
  }
}
</script>

<style scoped>
.popauth {
  width: 300px;
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 16px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.13), 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  white-space: normal;
  font-family: var(--font-inter);
}

/* ── Header ── */
.popauth-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.1rem 0.9rem;
  background: oklch(70.62% 0.139 158.37 / 6%);
  border-bottom: 1px solid #f1f5f9;
}

.popauth-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 999px;
  background: oklch(70.62% 0.139 158.37 / 15%);
  color: var(--primary);
  flex-shrink: 0;
}

.popauth-identity {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
  flex: 1;
}

.popauth-name {
  font-size: 0.9rem;
  font-weight: 650;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.popauth-role {
  font-size: 0.73rem;
  font-weight: 500;
  color: #64748b;
}

.popauth-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;
}

.popauth-close:hover {
  background: #f1f5f9;
  color: #475569;
}

/* ── Body ── */
.popauth-body {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 1rem 1.1rem;
}

.popauth-row {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-size: 0.82rem;
}

.popauth-icon {
  color: var(--primary);
  flex-shrink: 0;
}

.popauth-label {
  font-weight: 600;
  color: #475569;
  min-width: 58px;
}

.popauth-value {
  color: #1e293b;
  font-weight: 500;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Contact ── */
.popauth-contact {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  padding: 0.9rem 1.1rem 1rem;
  border-top: 1px solid #f1f5f9;
}

.popauth-contact-title {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94a3b8;
}

.popauth-email-row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.8rem;
  color: #334155;
}

.popauth-email-text {
  font-weight: 500;
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.popauth-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  border-radius: 6px;
  flex-shrink: 0;
  transition: color 0.15s, background 0.15s;
}

.popauth-icon-btn:hover {
  color: var(--primary);
  background: oklch(70.62% 0.139 158.37 / 8%);
}

.copied-icon {
  color: var(--primary);
}

.popauth-mailto-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.55rem 0.8rem;
  border: none;
  border-radius: 10px;
  background: var(--gradientCallToAction);
  color: #fff;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.popauth-mailto-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px oklch(70.62% 0.139 158.37 / 28%);
}

/* ── Transition ── */
.popauth-slide-enter-active,
.popauth-slide-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.popauth-slide-enter-from,
.popauth-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}
</style>
