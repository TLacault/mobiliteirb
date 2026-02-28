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
/**
 * Supprimer une mobilité par son ID
 * @param {string} id - UUID de la mobilité à supprimer
 * @returns {Promise<Object>} Message de succès ou erreur
 */
export async function deleteMobiliteById(id) {
  try {
    return await authenticatedFetch(`${API_BASE}/mobilites/${id}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error(`Erreur lors de la suppression de la mobilité ${id}:`, error);
    throw error;
  }
}

// TODO createMobilite(data) - Créer une nouvelle mobilité
/**
 * Créer une nouvelle mobilité
 * @param {Object} data - Données de la mobilité à créer
 * @returns {Promise<string>} - UUID de la nouvelle mobilité créée
 */
export async function createMobilite(data) {
  try {
    const response = await authenticatedFetch(`${API_BASE}/mobilites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.uuid;
  } catch (error) {
    console.error("Erreur lors de la création de la mobilité:", error);
    throw error;
  }
}
