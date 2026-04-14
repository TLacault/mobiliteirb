import { ref } from "vue";

/**
 * Utilities for place endpoints
 */

/**
 * Get the list of places for an input
 * @param {string} input - User typed text (minimum 2 characters)
 * @returns {Promise<Array>}
 */

export async function fetchCitySuggestions(input, apiKey) {
  if (!input || input.length < 2) {
    return [];
  }

  if (!apiKey) {
    throw new Error("Missing NUXT_PUBLIC_GMAPS_API_KEY runtime config");
  }

  try {
    const response = await $fetch(
      "https://places.googleapis.com/v1/places:autocomplete",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "suggestions.placePrediction.placeId,suggestions.placePrediction.text.text,suggestions.placePrediction.structuredFormat.mainText.text,suggestions.placePrediction.structuredFormat.secondaryText.text",
        },
        body: {
          input: input.trim(),
          languageCode: "fr",
          includedPrimaryTypes: ["(cities)"],
        },
      },
    );

    const suggestions = (response?.suggestions ?? [])
      .map(({ placePrediction }) => {
        if (!placePrediction?.structuredFormat) return null;
        const cityName = placePrediction.structuredFormat.mainText.text.trim();
        const countryName =
          placePrediction.structuredFormat.secondaryText.text.trim();
        return { cityName, countryName };
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

  const { public: publicConfig } = useRuntimeConfig();
  const apiKey = publicConfig?.gmapsApiKey;

  async function fetchSuggestions(query) {
    const normalizedQuery = query.trim();

    if (normalizedQuery.length < 3) {
      suggestions.value = [];
      suggestionsNotEmpty.value = false;
      return [];
    }

    try {
      const list = await fetchCitySuggestions(normalizedQuery, apiKey);
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
