<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { formatCitySuggestionLabel, useCityAutocomplete } from "~/utils/place";
import { useNotification } from "~/composables/useNotification";

defineOptions({ inheritAttrs: false });

const props = defineProps({
  modelValue: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue", "select", "invalid-blur"]);

const { notify } = useNotification();
const autocomplete = useCityAutocomplete();

const inputText = ref(props.modelValue);
const selectedLabel = ref(props.modelValue);
const highlightIndex = ref(-1);
const listRef = ref(null);

const isValid = computed(() => {
  if (!inputText.value.trim()) return true;
  return inputText.value === selectedLabel.value;
});

const showDropdown = computed(
  () =>
    autocomplete.suggestionsNotEmpty.value &&
    autocomplete.suggestions.value.length > 0,
);

watch(
  () => props.modelValue,
  (v) => {
    inputText.value = v;
    selectedLabel.value = v;
  },
);

function onInput(e) {
  const val = e.target.value;
  inputText.value = val;
  highlightIndex.value = -1;
  emit("update:modelValue", val);
  autocomplete.handleInput(val);
}

function onFocus() {
  autocomplete.handleFocus();
}

function onBlur() {
  setTimeout(() => {
    autocomplete.handleBlur();
    highlightIndex.value = -1;

    if (inputText.value.trim() && inputText.value !== selectedLabel.value) {
      notify(
        "warning",
        "Veuillez sélectionner un lieu parmi les suggestions proposées.",
      );
      emit("invalid-blur");
    }
  }, 150);
}

function selectSuggestion(suggestion) {
  const label = formatCitySuggestionLabel(suggestion);
  inputText.value = label;
  selectedLabel.value = label;
  highlightIndex.value = -1;
  emit("update:modelValue", label);
  emit("select", suggestion);
  autocomplete.close();
}

function onKeydown(e) {
  const items = autocomplete.suggestions.value;
  if (!items.length || !showDropdown.value) return;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    highlightIndex.value =
      highlightIndex.value >= items.length - 1 ? 0 : highlightIndex.value + 1;
    scrollToHighlighted();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    highlightIndex.value =
      highlightIndex.value <= 0 ? items.length - 1 : highlightIndex.value - 1;
    scrollToHighlighted();
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (highlightIndex.value >= 0 && highlightIndex.value < items.length) {
      selectSuggestion(items[highlightIndex.value]);
    }
  } else if (e.key === "Escape") {
    autocomplete.close();
    highlightIndex.value = -1;
  }
}

function scrollToHighlighted() {
  nextTick(() => {
    if (!listRef.value) return;
    const el = listRef.value.children[highlightIndex.value];
    if (el) el.scrollIntoView({ block: "nearest" });
  });
}
</script>

<template>
  <div class="place-autocomplete">
    <input
      v-bind="$attrs"
      :value="inputText"
      type="text"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
      @keydown="onKeydown"
    />

    <ul v-if="showDropdown" ref="listRef" class="place-autocomplete-dropdown">
      <li
        v-for="(s, i) in autocomplete.suggestions.value"
        :key="`${s.cityName}-${s.countryName}`"
        class="place-autocomplete-item"
        :class="{ highlighted: i === highlightIndex }"
        @mousedown.prevent="selectSuggestion(s)"
      >
        {{ s.cityName }}, {{ s.countryName }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.place-autocomplete {
  position: relative;
  width: 100%;
}

.place-autocomplete-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 30;
  margin: 0;
  padding: 0.35rem 0;
  list-style: none;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
  max-height: 220px;
  overflow-y: auto;
}

.place-autocomplete-item {
  padding: 0.55rem 0.7rem;
  cursor: pointer;
  font-size: 0.84rem;
  color: #0f172a;
  border-radius: 6px;
  margin: 0 0.25rem;
  transition: background 0.1s ease, color 0.1s ease;
}

.place-autocomplete-item:hover {
  background: #f1f5f9;
}

.place-autocomplete-item.highlighted {
  background: oklch(70.62% 0.139 158.37 / 12%);
  color: var(--primary, #16a34a);
}
</style>
