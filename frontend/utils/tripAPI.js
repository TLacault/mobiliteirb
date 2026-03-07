/**
 * API utilities for mobilité endpoints
 */

import { API_BASE, authenticatedFetch } from "./authFetch.js";

/**
 * Récupère la liste des UUIDs des trajets d'une mobilité
 * @returns {Promise<Array>}
 */
export async function getTripUuids(mobilityId) {
    if (!mobilityId) {
        throw new Error("mobilityId est requis pour récupérer les trajets");
    }

    try {
      return await authenticatedFetch(`${API_BASE}/trips/mobility/${mobilityId}`);
    } catch (error) {
        console.error("Erreur lors de la récupération des trajets:", error);
        throw error;
    }
}

/**
 * Récupère le détail d'un trajet par son UUID
 * @param {string} id - UUID du trajet
 * @returns {Promise<Object>} Détail du trajet avec stats
 */
export async function getTripById(id) {
  if (!id) {
    throw new Error("id est requis pour récupérer un trajet");
  }

  try {
    return await authenticatedFetch(`${API_BASE}/trips/${id}`);
  } catch (error) {
    console.error(
      `Erreur lors de la récupération du trajet ${id}:`,
      error,
    );
    throw error;
  }
}


