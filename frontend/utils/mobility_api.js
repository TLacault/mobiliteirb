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
