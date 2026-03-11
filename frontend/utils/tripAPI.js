/**
 * API utilities for trip endpoints
 */

import { API_BASE, authenticatedFetch } from "./authFetch.js";

/**
 * Get the list of trips for a mobility
 * @param {string} mobilityId - Mobility UUID
 * @returns {Promise<Array>}
 */
export async function getTrips(mobilityId) {
  if (!mobilityId) {
    throw new Error("mobilityId is required to fetch trips");
  }

  try {
    return await authenticatedFetch(
      `${API_BASE}/mobilities/${mobilityId}/trips`,
    );
  } catch (error) {
    console.error("Error fetching trips:", error);
    throw error;
  }
}

/**
 * Get a trip by its UUID
 * @param {string} id - Trip UUID
 * @returns {Promise<Object>} Trip detail with stats
 */
export async function getTrip(id) {
  if (!id) {
    throw new Error("id is required to fetch a trip");
  }

  try {
    return await authenticatedFetch(`${API_BASE}/trips/${id}`);
  } catch (error) {
    console.error(`Error fetching trip ${id}:`, error);
    throw error;
  }
}

/**
 * Update a trip by its UUID
 * @param {string} id - Trip UUID
 * @param {Object} data - Fields to update
 * @returns {Promise<Object>} Updated trip
 */
export async function updateTrip(id, data) {
  if (!id) {
    throw new Error("id is required to update a trip");
  }

  try {
    return await authenticatedFetch(`${API_BASE}/trips/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error(`Error updating trip ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a trip by its UUID
 * @param {string} id - Trip UUID
 * @returns {Promise<Object>} Delete response
 */
export async function deleteTrip(id) {
  if (!id) {
    throw new Error("id is required to delete a trip");
  }

  try {
    return await authenticatedFetch(`${API_BASE}/trips/${id}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error(`Error deleting trip ${id}:`, error);
    throw error;
  }
}
