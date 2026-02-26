/**
 * API utilities for making fetch calls to backend endpoints
 */

const API_BASE = "http://localhost:3001/api/v1";

/**
 * Récupère la liste des UUIDs des mobilités de l'utilisateur connecté
 * @returns {Promise<Array>} Liste des mobilités avec leurs UUIDs
 */
export async function getMobiliteUuids() {
  try {
    const token = localStorage.getItem("access_token");
    const response = await $fetch(`${API_BASE}/mobilites`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response;
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
    const token = localStorage.getItem("access_token");
    const response = await $fetch(`${API_BASE}/mobilites/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response;
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
