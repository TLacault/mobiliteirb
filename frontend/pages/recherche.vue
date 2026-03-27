<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import SearchFiltersSidebar from "../components/recherche/SearchFiltersSidebar.vue";
import { searchMobilty } from "../utils/mobility_api.js";
import {
  Route,
  History,
  ArrowDownAZ,
  ArrowDownWideNarrow,
  Leaf,
  ListOrdered,
  Timer,
  Ruler,
  ChevronDown,
} from "lucide-vue-next";

useHead({
  title: "Recherche",
});

const sortField = ref(null);
const sortDirection = ref(null);

const baseSortOptions = [
  { value: "createdAt", label: "Date Création", icon: History },
  { value: "alpha", label: "Alphabétique", icon: ArrowDownAZ },
];

const statsSortOptions = [
  { value: "emissions", label: "Émissions CO₂", icon: Leaf },
  { value: "duration", label: "Temps", icon: Timer },
  { value: "distance", label: "Distance", icon: Ruler },
  { value: "steps", label: "Nombre Etapes", icon: ListOrdered },
];

const allSortOptions = [...baseSortOptions, ...statsSortOptions];

const optionDirection = computed(() => {
  const byField = {};
  if (sortField.value && sortDirection.value) {
    byField[sortField.value] = sortDirection.value;
  }
  return byField;
});

const orderFieldMap = {
  createdAt: "lastEdit",
  alpha: "name",
  emissions: "emissions",
  duration: "duration",
  distance: "distance",
  steps: "steps",
};

const orderQuery = computed(
  () =>
    (orderFieldMap[sortField.value] && sortDirection.value &&
      `${orderFieldMap[sortField.value]}_${sortDirection.value}`) ||
    undefined,
);

function nextSortDirection(field) {
  if (sortField.value !== field || !sortDirection.value) return "desc";
  if (sortDirection.value === "desc") return "asc";
  return null;
}

function applySortCycle(field, includeNone = true) {
  if (field === "createdAt") {
    sortField.value = null;
    sortDirection.value = null;
    return;
  }

  const nextDirection = nextSortDirection(field);
  if (!nextDirection) {
    if (includeNone) {
      sortField.value = null;
      sortDirection.value = null;
    } else {
      sortField.value = field;
      sortDirection.value = "desc";
    }
    return;
  }

  sortField.value = field;
  sortDirection.value = nextDirection;
}

function handleSortOptionClick(field) {
  applySortCycle(field, false);
  isDropdownOpen.value = false;
}

const selectedOption = computed(() => {
  if (!sortField.value || !sortDirection.value) return baseSortOptions[0];
  return (
    allSortOptions.find((option) => option.value === sortField.value) ??
    baseSortOptions[0]
  );
});

const isDropdownOpen = ref(false);
const dropdownRef = ref(null);

const closeDropdown = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener("click", closeDropdown);
});

const searchResults = ref(null);

async function handleSearch(filters = {}) {
  const {
    departure = "",
    arrival = "",
    transportModes = [],
    emissions,
    duration,
    distance,
    steps,
  } = filters;

  searchResults.value = await searchMobilty({
    departure,
    arrival,
    transportModes,
    emissions,
    duration,
    distance,
    steps,
    order: orderQuery.value,
  });

  //   mobility info
  console.log("Résultats de recherche :", searchResults.value);
}
</script>

<template>
  <div class="search-page">
    <div class="search-layout">
      <SearchFiltersSidebar @search="handleSearch" />

      <div class="results-wrapper">
        <header class="section-header">
          <div class="section-header-left">
            <Route class="section-icon" size="32" />
            <h2 class="section-title gradient-cta">Résultats</h2>
          </div>

          <div class="section-header-right">
            <div ref="dropdownRef" class="sort-dropdown">
              <button
                class="sort-trigger"
                @click.stop="isDropdownOpen = !isDropdownOpen"
              >
                <component :is="selectedOption.icon" size="16" />
                <span>{{ selectedOption.label }}</span>
                <ChevronDown
                  size="14"
                  class="chevron"
                  :class="{ open: isDropdownOpen }"
                />
              </button>

              <Transition name="dropdown">
                <div v-if="isDropdownOpen" class="sort-menu">
                  <button
                    v-for="opt in baseSortOptions"
                    :key="opt.value"
                    class="sort-option"
                    :class="{
                      active:
                        opt.value === 'createdAt'
                          ? !sortDirection
                          : sortField === opt.value && !!sortDirection,
                    }"
                    @click="handleSortOptionClick(opt.value)"
                  >
                    <component :is="opt.icon" size="16" class="opt-icon" />
                    <span>{{ opt.label }}</span>
                    <ArrowDownWideNarrow
                      size="14"
                      class="sort-state-icon"
                      :class="{
                        active:
                          opt.value === 'createdAt'
                            ? !sortDirection
                            : sortField === opt.value && !!sortDirection,
                        asc: optionDirection[opt.value] === 'asc',
                      }"
                    />
                  </button>

                  <div class="sort-separator">
                    <span class="sort-separator-label">Stats</span>
                  </div>

                  <button
                    v-for="opt in statsSortOptions"
                    :key="opt.value"
                    class="sort-option"
                    :class="{
                      active: sortField === opt.value && !!sortDirection,
                    }"
                    @click="handleSortOptionClick(opt.value)"
                  >
                    <component :is="opt.icon" size="16" class="opt-icon" />
                    <span>{{ opt.label }}</span>
                    <ArrowDownWideNarrow
                      size="14"
                      class="sort-state-icon"
                      :class="{
                        active: sortField === opt.value && !!sortDirection,
                        asc: optionDirection[opt.value] === 'asc',
                      }"
                    />
                  </button>
                </div>
              </Transition>
            </div>
          </div>
        </header>

        <section class="results-section">
          <div class="section-container results-container">
            <p class="placeholder-text">
              Zone des cartes de mobilité (1 carte par ligne)
            </p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-page {
  min-height: calc(100vh - 73px);
  padding: 2rem;
}

.search-layout {
  width: 100%;
  max-width: 1500px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(270px, 320px) minmax(0, 1fr);
  gap: 1.5rem;
  align-items: start;
}

.results-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.results-section {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  padding: 1.25rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.section-header-left,
.section-header-right {
  display: flex;
  align-items: center;
}

.section-header-left {
  gap: 0.75rem;
}

.section-icon {
  color: var(--primary);
  flex-shrink: 0;
}

.section-title {
  margin: 0;
}

.section-container {
  border: 1.5px dashed #dbe3ec;
  border-radius: 14px;
  background: #fafbfc;
  padding: 1rem;
}

.results-container {
  min-height: 620px;
}

.placeholder-text {
  margin: 0;
  color: #6b7280;
  font-size: 0.92rem;
}

.sort-dropdown {
  position: relative;
}

.sort-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 38px;
  padding: 0 1rem;
  border-radius: 100px;
  border: 1.5px solid #e5e7eb;
  background-color: white;
  color: #374151;
  font-size: var(--font-body);
  font-weight: 400;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  white-space: nowrap;
}

.sort-trigger:hover {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px oklch(70.62% 0.139 158.37 / 10%);
}

.chevron {
  color: #9ca3af;
  transition: transform 0.2s ease;
  margin-left: 0.15rem;
}

.chevron.open {
  transform: rotate(180deg);
}

.sort-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 200px;
  background: white;
  border: 1.5px solid #e5e7eb;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 30;
}

.sort-option {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.65rem 1rem;
  border: none;
  background: transparent;
  color: #374151;
  font-size: var(--font-body);
  font-weight: 400;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.15s ease;
}

.sort-option:not(:last-child) {
  border-bottom: 1px solid #f3f4f6;
}

.sort-option:hover {
  background-color: #f9fafb;
}

.sort-option.active {
  color: var(--primary);
  font-weight: 500;
  background-color: oklch(70.62% 0.139 158.37 / 6%);
}

.opt-icon {
  flex-shrink: 0;
  color: #9ca3af;
}

.sort-option.active .opt-icon {
  color: var(--primary);
}

.sort-separator {
  display: flex;
  align-items: center;
  padding: 0.45rem 1rem 0.4rem;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #f3f4f6;
  background: #fbfcfd;
}

.sort-separator-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94a3b8;
}

.sort-state-icon {
  margin-left: auto;
  color: var(--primary);
  opacity: 0;
  flex-shrink: 0;
  transition: transform 0.2s ease, color 0.2s ease, opacity 0.2s ease;
}

.sort-state-icon.active,
.sort-option:hover .sort-state-icon {
  opacity: 1;
  color: var(--primary);
}

.sort-state-icon.asc {
  transform: rotate(180deg);
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 1024px) {
  .search-page {
    padding: 1.25rem;
  }

  .search-layout {
    grid-template-columns: 1fr;
  }

  .results-container {
    min-height: 260px;
  }
}
</style>
