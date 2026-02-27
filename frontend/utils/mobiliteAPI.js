/**
 * API utilities for mobilité endpoints
 */

import { API_BASE, authenticatedFetch } from "./authFetch.js";

/**
 * Récupère la liste des UUIDs des mobilités de l'utilisateur connecté
 * @returns {Promise<Array>}
 */
export async function getMobiliteUuids() {
  try {
    return await authenticatedFetch(`${API_BASE}/mobilites`);
  } catch (error) {
    console.error("Erreur lors de la récupération des mobilités:", error);
    throw error;
  }
}

/**
 * Récupère le détail d'une mobilité par son UUID
 * @param {string} id - UUID de la mobilité
 * @returns {Promise<Object>} Détail de la mobilité avec stats
 */
export async function getMobiliteById(id) {
  try {
    return await authenticatedFetch(`${API_BASE}/mobilites/${id}`);
  } catch (error) {
    console.error(
      `Erreur lors de la récupération de la mobilité ${id}:`,
      error,
    );
    throw error;
  }
}

// TODO deleteMobiliteById(id) - Supprimer une mobilité par son ID

// TODO createMobilite(data) - Créer une nouvelle mobilité
