import { ref } from "vue";

/**
 * Utilities for place endpoints
 */

/**
 * Get the list of places for an input
 * @param {string} input - User typed text (minimum 2 characters)
 * @returns {Promise<Array>}
 */

export async function fetchCitySuggestions(input) {
  if (!input || input.length < 2) {
    return [];
  }

  try {
    const response = await $fetch("/api/v1/places/autocomplete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: { input: input.trim() },
    });

    const extractText = (value) => {
      if (typeof value === "string") return value.trim();
      if (value && typeof value.text === "string") return value.text.trim();
      return "";
    };

    const suggestions = (response?.suggestions ?? [])
      .map(({ placePrediction }) => {
        if (!placePrediction) return null;

        const structuredFormat = placePrediction.structuredFormat ?? {};
        const cityName = extractText(structuredFormat.mainText);
        const countryName = extractText(structuredFormat.secondaryText);

        if (cityName && countryName) {
          return { cityName, countryName };
        }

        const predictionText = extractText(placePrediction.text);
        if (!predictionText) return null;

        const [fallbackCity = "", ...rest] = predictionText
          .split(",")
          .map((part) => part.trim())
          .filter(Boolean);
        const fallbackCountry = rest.length ? rest[rest.length - 1] : "";

        if (!fallbackCity || !fallbackCountry) return null;
        return { cityName: fallbackCity, countryName: fallbackCountry };
      })
      .filter(Boolean)
      .filter((s) => s.cityName && s.countryName)
      .filter(
        (s, index, arr) =>
          arr.findIndex(
            (item) =>
              item.cityName.toLowerCase() === s.cityName.toLowerCase() &&
              item.countryName.toLowerCase() === s.countryName.toLowerCase(),
          ) === index,
      );

    return suggestions;
  } catch (error) {
    console.error(
      `Error fetching place suggestions for input ${input}:`,
      error,
    );
    throw error;
  }
}

export function formatCitySuggestionLabel(suggestion) {
  return `${suggestion.cityName}, ${suggestion.countryName}`;
}

export function useCityAutocomplete() {
  const suggestions = ref([]);
  const suggestionsNotEmpty = ref(false);
  const timer = ref(null);

  async function fetchSuggestions(query) {
    const normalizedQuery = query.trim();

    if (normalizedQuery.length < 3) {
      suggestions.value = [];
      suggestionsNotEmpty.value = false;
      return [];
    }

    try {
      const list = await fetchCitySuggestions(normalizedQuery);
      suggestions.value = list;
      suggestionsNotEmpty.value = list.length > 0;
      return list;
    } catch (error) {
      console.error("Error fetching autocomplete suggestions:", error);
      suggestions.value = [];
      suggestionsNotEmpty.value = false;
      return [];
    }
  }

  function handleInput(query) {
    if (timer.value) {
      clearTimeout(timer.value);
    }

    timer.value = setTimeout(() => {
      void fetchSuggestions(query);
    }, 300);
  }

  function handleFocus() {
    suggestionsNotEmpty.value = suggestions.value.length > 0;
  }

  function handleBlur() {
    setTimeout(() => {
      suggestionsNotEmpty.value = false;
    }, 120);
  }

  function close() {
    suggestions.value = [];
    suggestionsNotEmpty.value = false;
  }

  return {
    suggestions,
    suggestionsNotEmpty,
    handleInput,
    handleFocus,
    handleBlur,
    close,
  };
}
