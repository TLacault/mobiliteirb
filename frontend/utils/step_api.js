/**
 * API utilities for step endpoints
 */

import { API_BASE, authenticatedFetch } from "./authFetch.js";

/**
 * Get the list of steps for a trip
 * @param {string} tripId - Trip UUID
 * @returns {Promise<Array>}
 */
export async function getStepsByTrip(tripId) {
  if (!tripId) {
    throw new Error("tripId is required to fetch steps");
  }

  try {
    return await authenticatedFetch(`${API_BASE}/trips/${tripId}/steps`);
  } catch (error) {
    console.error(`Error fetching steps for trip ${tripId}:`, error);
    throw error;
  }
}

/**
 * Get a step by its UUID
 * @param {string} stepId - Step UUID
 * @returns {Promise<Object>}
 */
export async function getStep(stepId) {
  if (!stepId) {
    throw new Error("stepId is required to fetch a step");
  }

  try {
    return await authenticatedFetch(`${API_BASE}/steps/${stepId}`);
  } catch (error) {
    console.error(`Error fetching step ${stepId}:`, error);
    throw error;
  }
}

/**
 * Delete a step by its UUID
 * @param {string} stepId - Step UUID
 * @returns {Promise<void>}
 */
export async function deleteStep(stepId) {
  if (!stepId) {
    throw new Error("stepId is required to delete a step");
  }

  try {
    return await authenticatedFetch(`${API_BASE}/steps/${stepId}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error(`Error deleting step ${stepId}:`, error);
    throw error;
  }
}
