<script setup>
import { computed } from "vue";
import { ChevronLeft, ChevronRight } from "lucide-vue-next";

const props = defineProps({
  page: { type: Number, required: true },
  totalPages: { type: Number, required: true },
});

const emit = defineEmits(["update:page"]);

const visiblePages = computed(() => {
  const total = props.totalPages;
  const current = props.page;
  const pages = [];

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
    return pages;
  }

  pages.push(1);

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");

  pages.push(total);
  return pages;
});
</script>

<template>
  <nav v-if="totalPages > 1" class="pagination">
    <button
      class="page-btn nav-btn"
      :disabled="page <= 1"
      @click="emit('update:page', page - 1)"
    >
      <ChevronLeft size="16" />
    </button>

    <template v-for="(p, i) in visiblePages" :key="i">
      <span v-if="p === '...'" class="page-ellipsis">…</span>
      <button
        v-else
        class="page-btn"
        :class="{ active: p === page }"
        @click="emit('update:page', p)"
      >
        {{ p }}
      </button>
    </template>

    <button
      class="page-btn nav-btn"
      :disabled="page >= totalPages"
      @click="emit('update:page', page + 1)"
    >
      <ChevronRight size="16" />
    </button>
  </nav>
</template>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
}

.page-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 34px;
  height: 34px;
  padding: 0 0.4rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 9px;
  background: #fff;
  color: #374151;
  font-size: 0.82rem;
  font-weight: 550;
  cursor: pointer;
  transition: all 0.15s ease;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--primary);
  color: var(--primary);
  background: oklch(70.62% 0.139 158.37 / 6%);
}

.page-btn.active {
  border-color: var(--primary);
  background: var(--primary);
  color: #fff;
}

.page-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.nav-btn {
  padding: 0;
}

.page-ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 34px;
  color: #94a3b8;
  font-size: 0.85rem;
  user-select: none;
}
</style>
