/**
 * API utilities for mobility endpoints
 */

import { API_BASE, authenticatedFetch } from "./authFetch.js";

/**
 * Get the list of mobilities for the authenticated user
 * @returns {Promise<Array>}
 */
export async function getMobilities() {
  try {
    return await authenticatedFetch(`${API_BASE}/mobilities`);
  } catch (error) {
    console.error("Error fetching mobilities:", error);
    throw error;
  }
}

/**
 * Get a mobility by its ID (properties only)
 * @param {string} id - Mobility ID
 * @returns {Promise<Object>} Mobility properties and trip list
 */
export async function getMobility(id) {
  if (!id) {
    throw new Error("id is required to fetch a mobility");
  }

  try {
    return await authenticatedFetch(`${API_BASE}/mobilities/${id}`);
  } catch (error) {
    console.error(`Error fetching mobility ${id}:`, error);
    throw error;
  }
}

/**
 * Get aggregated statistics for a mobility
 * @param {string} id - Mobility ID
 * @returns {Promise<Object>} Aggregated statistics
 */
export async function getMobilityStats(id) {
  if (!id) {
    throw new Error("id is required to fetch mobility stats");
  }

  try {
    return await authenticatedFetch(`${API_BASE}/mobilities/${id}/stats`);
  } catch (error) {
    console.error(`Error fetching mobility stats ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a mobility by its ID
 * @param {string} id - Mobility ID to delete
 * @returns {Promise<Object>} Success message or error
 */
export async function deleteMobility(id) {
  try {
    return await authenticatedFetch(`${API_BASE}/mobilities/${id}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error(`Error deleting mobility ${id}:`, error);
    throw error;
  }
}

/**
 * Create a new mobility
 * @param {Object} data - Mobility data
 * @returns {Promise<string>} ID of the newly created mobility
 */
export async function createMobility(data) {
  try {
    const response = await authenticatedFetch(`${API_BASE}/mobilities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.id;
  } catch (error) {
    console.error("Error creating mobility:", error);
    throw error;
  }
}

/**
 * Update a mobility by its ID
 * @param {string} id - Mobility ID
 * @param {Object} data - Fields to update
 * @returns {Promise<Object>}
 */
export async function updateMobility(id, data) {
  try {
    const response = await authenticatedFetch(`${API_BASE}/mobilities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error(`Error updating mobility ${id}:`, error);
    throw error;
  }
}

/**
 * Search public mobilities with filters, sort and pagination
 * @param {Object} params
 * @param {string} [params.query]
 * @param {string} [params.order]
 * @param {number} [params.page]
 * @returns {Promise<{data: Array, pagination: Object}>}
 */
export async function searchMobilty({
  query = "",
  order,
  page = 1,
  departure,
  arrival,
  emissions,
  duration,
  distance,
  steps,
  transportModes,
} = {}) {
  try {
    const searchParams = new URLSearchParams();

    if (query) {
      searchParams.set("query", query);
      searchParams.set("criteria", query);
    }
    if (order) {
      searchParams.set("order", order);
    }

    const setIfPresent = (key, value) => {
      if (value === undefined || value === null || value === "") return;
      searchParams.set(key, String(value));
    };

    const setRange = (minKey, maxKey, range) => {
      if (!range || typeof range !== "object") return;
      setIfPresent(minKey, range.min);
      setIfPresent(maxKey, range.max);
    };

    setIfPresent("departure", departure);
    setIfPresent("arrival", arrival);

    setRange("minCarbon", "maxCarbon", emissions);
    setRange("minTime", "maxTime", duration);
    setRange("minDistance", "maxDistance", distance);
    setRange("minSteps", "maxSteps", steps);

    if (Array.isArray(transportModes) && transportModes.length > 0) {
      searchParams.set("transportModes", transportModes.join(","));
    }

    searchParams.set("page", String(page));

    return await authenticatedFetch(
      `${API_BASE}/mobilities/searchMobilty?${searchParams.toString()}`,
    );
  } catch (error) {
    console.error("Error searching mobilities:", error);
    throw error;
  }
}

/**
 * Duplicate a mobility by its ID
 * @param {string} id - Mobility ID to duplicate
 * @returns {Promise<Object>} The newly duplicated mobility object
 */
export async function duplicateMobility(id) {
  try {
    const response = await authenticatedFetch(
      `${API_BASE}/mobilities/${id}/duplicate`,
      {
        method: "POST",
      },
    );
    return response;
  } catch (error) {
    console.error(`Error duplicating mobility ${id}:`, error);
    throw error;
  }
}

/**
 * Export a mobility by its ID in the specified format (pdf, json, etc.)
 * @param {string} id - Mobility ID to export
 * @param {string} mode - Export format (e.g., "pdf", "json")
 * @returns {Promise<Blob>} The exported file as a Blob
 */
export async function exportMobility(id, mode) {
  try {
    const response = await authenticatedFetch(
      `${API_BASE}/mobilities/${id}/export?mode=${mode}`,
      {
        method: "GET",
        ...(mode === "pdf" || mode === "csv" ? { responseType: "blob" } : {}),
      },
    );
    return response;
  } catch (error) {
    console.error(`Error exporting mobility ${id}:`, error);
    throw error;
  }
}
