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


/**
 * Met à jour les stats d'un trajet spécifique
 * @param {string} id - UUID du trajet
 * @param {Object} stats - Objet contenant les stats à mettre à jour
 * @returns {Promise<Object>} Trajet mis à jour
 */
export async function updateTripStats(id, stats) {
  if (!id) {
    throw new Error("id est requis pour mettre à jour un trajet");
  }

  try {
    return await authenticatedFetch(`${API_BASE}/trips/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stats),
    });
  } catch (error) {
    console.error(
      `Erreur lors de la mise à jour du trajet ${id}:`,
      error,
    );
    throw error;
  }
}

/** * Supprime un trajet par son UUID
 * @param {string} id - UUID du trajet
 * @returns {Promise<Object>} Réponse de suppression
 */
export async function deleteTrip(id) {
  if (!id) {
    throw new Error("id est requis pour supprimer un trajet");
  }

  try {
    return await authenticatedFetch(`${API_BASE}/trips/${id}`, {
      method: "DELETE",
    });

  } catch (error) {
    console.error(
      `Erreur lors de la suppression du trajet ${id}:`,
      error,
    );
    throw error;
  }
}
