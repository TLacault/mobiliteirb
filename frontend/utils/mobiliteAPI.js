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
    const response = await $fetch(`${API_BASE}/mobilites`, {
      credentials: "include",
    });
    return response;
  } catch (error) {
    console.error("Erreur lors de la récupération des mobilités:", error);
    throw error;
  }
}

// TODO getMobiliteById(id) - Récupérer une mobilité par son ID

// TODO deleteMobiliteById(id) - Supprimer une mobilité par son ID

// TODO createMobilite(data) - Créer une nouvelle mobilité
