/**
 * API utilities for trip endpoints
 */

import { API_BASE, authenticatedFetch } from "./authFetch.js";

/**
 * Get the list of trips for a mobility
 * @param {string} mobilityId - Mobility ID
 * @param {string} order - Sort order
 * @returns {Promise<Array>}
 */
export async function getTrips(
  mobilityId,
  order = "createdAt",
  preview = false,
) {
  if (!mobilityId) {
    throw new Error("mobilityId is required to fetch trips");
  }

  try {
    const params = new URLSearchParams();
    if (order) params.set("order", order);
    if (preview) params.set("preview", "true");
    return await authenticatedFetch(
      `${API_BASE}/mobilities/${mobilityId}/trips?${params.toString()}`,
    );
  } catch (error) {
    console.error("Error fetching trips:", error);
    throw error;
  }
}

/**
 * Get a trip by its ID (properties only)
 * @param {string} id - Trip ID
 * @returns {Promise<Object>} Trip properties
 */
export async function getTrip(id, preview = false) {
  if (!id) {
    throw new Error("id is required to fetch a trip");
  }

  try {
    return await authenticatedFetch(
      `${API_BASE}/trips/${id}${preview ? "?preview=true" : ""}`,
    );
  } catch (error) {
    console.error(`Error fetching trip ${id}:`, error);
    throw error;
  }
}

/**
 * Get trip statistics
 * @param {string} id - Trip ID
 * @returns {Promise<Object>} Trip statistics
 */
export async function getTripStats(id, preview = false) {
  if (!id) {
    throw new Error("id is required to fetch trip stats");
  }

  try {
    return await authenticatedFetch(
      `${API_BASE}/trips/${id}/stats${preview ? "?preview=true" : ""}`,
    );
  } catch (error) {
    console.error(`Error fetching trip stats ${id}:`, error);
    throw error;
  }
}

/**
 * Create a new trip
 * @param {string} mobilityId - Mobility ID
 * @param {string} name - Trip name
 * @returns {Promise<Object>} Created trip ID
 */
export async function createTrip(mobilityId, name) {
  if (!mobilityId) {
    throw new Error("mobilityId is required to create a trip");
  }

  try {
    return await authenticatedFetch(
      `${API_BASE}/mobilities/${mobilityId}/trips`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      },
    );
  } catch (error) {
    console.error(`Error creating trip for mobility ${mobilityId}:`, error);
    throw error;
  }
}

/**
 * Update a trip by its ID
 * @param {string} id - Trip ID
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
 * Fetch all trips for a mobility with their statistics.
 * Returns an array of trip objects with stats: { id, name, isSelected, emissions, distance, steps, ... }.
 * @param {string} mobilityId - Mobility ID
 * @param {string} order - Sort order
 * @returns {Promise<Array>}
 */
export async function getMobilityTrips(
  mobilityId,
  order = "createdAt",
  preview = false,
) {
  const data = await getTrips(mobilityId, order, preview);
  const items = Array.isArray(data) ? data : data.trips || [];

  return Promise.all(
    items.map(async (item) => {
      const id = item?.id ?? item?.uuid;
      try {
        const tripData = await getTrip(id, preview);
        const stats = await getTripStats(id, preview);
        return {
          id,
          ...tripData,
          emissions: stats?.totalCarbon ?? 0,
          distance: stats?.totalDistance ?? 0,
          time: stats?.totalTime ?? 0,
          steps: stats?.stepCount ?? 0,
        };
      } catch (e) {
        console.error(`Error fetching trip details ${id}:`, e);
        return {
          id,
          name: null,
          emissions: 0,
          distance: 0,
          time: 0,
          steps: 0,
          from: null,
          to: null,
        };
      }
    }),
  );
}

/**
 * Delete a trip by its ID
 * @param {string} id - Trip ID
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
