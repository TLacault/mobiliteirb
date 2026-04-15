/**
 * Geocoding utility using OpenStreetMap Nominatim (free, no API key needed).
 * Caches results to avoid redundant requests.
 * Respects Nominatim usage policy: max 1 request per second.
 */

const cache = new Map();
let lastRequestTime = 0;
const MIN_INTERVAL_MS = 1100; // slightly over 1s to respect rate limit

/**
 * Geocode a city/place name to lat/lng coordinates.
 * Tries the full name first, then progressively shorter prefixes
 * (e.g. "New York, État de New York, États-Unis" → "New York, État de New York" → "New York").
 * @param {string} placeName - The place name to geocode
 * @returns {Promise<{lat: number, lng: number} | null>} Coordinates or null if not found
 */
export async function geocodePlace(placeName) {
  if (!placeName || !placeName.trim()) return null;

  const key = placeName.trim().toLowerCase();
  if (cache.has(key)) return cache.get(key);

  // Build candidate queries: full string, then progressively drop trailing segments
  const parts = placeName
    .trim()
    .split(",")
    .map((s) => s.trim());
  const candidates = [];
  for (let i = parts.length; i >= 1; i--) {
    candidates.push(parts.slice(0, i).join(", "));
  }

  for (const query of candidates) {
    const result = await _nominatimSearch(query);
    if (result) {
      cache.set(key, result);
      return result;
    }
  }

  cache.set(key, null);
  return null;
}

/**
 * Single Nominatim search request with rate-limiting.
 * @param {string} query
 * @returns {Promise<{lat: number, lng: number} | null>}
 */
async function _nominatimSearch(query) {
  // Rate-limit: wait if needed
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_INTERVAL_MS) {
    await new Promise((r) => setTimeout(r, MIN_INTERVAL_MS - elapsed));
  }
  lastRequestTime = Date.now();

  try {
    const params = new URLSearchParams({
      q: query,
      format: "json",
      limit: "1",
      "accept-language": "fr",
    });

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      {
        headers: {
          "User-Agent": "MobilitEirb/1.0 (student project)",
        },
      },
    );

    if (!res.ok) {
      console.warn(`Nominatim returned ${res.status} for "${query}"`);
      return null;
    }

    const data = await res.json();
    if (!data.length) return null;

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  } catch (err) {
    console.error(`Geocoding error for "${query}":`, err);
    return null;
  }
}

/**
 * Geocode multiple place names, returning a Map of name → {lat, lng}.
 * Deduplicates requests for identical names.
 * @param {string[]} placeNames
 * @returns {Promise<Map<string, {lat: number, lng: number}>>}
 */
export async function geocodePlaces(placeNames) {
  const unique = [...new Set(placeNames.filter(Boolean))];
  const results = new Map();

  for (const name of unique) {
    const coords = await geocodePlace(name);
    if (coords) results.set(name, coords);
  }

  return results;
}
