/**
 * API utilities for making fetch calls to backend endpoints
 */

const API_BASE = "http://localhost:3001/api/v1";

/**
 * Tente de rafraîchir l'access token via le refresh token.
 * Met à jour localStorage si succès, sinon nettoie les tokens.
 * @returns {string|null} Le nouvel access token ou null
 */
async function tryRefreshToken() {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) return null;

  try {
    const data = await $fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      body: { refreshToken },
    });
    localStorage.setItem("access_token", data.access_token);
    if (data.refresh_token) {
      localStorage.setItem("refresh_token", data.refresh_token);
    }
    return data.access_token;
  } catch {
    // Refresh token invalide ou expiré → déconnecter l'utilisateur
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    return null;
  }
}

/**
 * Wrapper authentifié autour de $fetch.
 * Envoie le Bearer token et relance la requête une fois après un 401
 * (refresh automatique du token).
 * @param {string} url
 * @param {object} options - options $fetch
 */
async function authenticatedFetch(url, options = {}) {
  const token = localStorage.getItem("access_token");

  const makeRequest = (t) =>
    $fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
      },
    });

  try {
    return await makeRequest(token);
  } catch (err) {
    // Sur 401, essayer de rafraîchir le token et relancer une fois
    if (err?.response?.status === 401) {
      const newToken = await tryRefreshToken();
      if (!newToken) throw err; // Refresh échoué, propager l'erreur
      return await makeRequest(newToken);
    }
    throw err;
  }
}

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
