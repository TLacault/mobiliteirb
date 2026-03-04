export const useAuth = () => {
  // @ts-ignore
  const config = useRuntimeConfig();

  // Configuration OpenID EirbConnect
  const OPENID_CONFIG = {
    serverUrl: "https://connect.vpn.eirb.fr/realms/eirb",
    clientId: "mobilit",
    redirectUri:
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : "http://localhost:8080/auth/callback",
  };

  // URL de l'API backend
  const API_BASE = config.public.apiBase || "http://localhost:3001/api/v1";

  // État de l'utilisateur (réactif)
  // @ts-ignore
  const user = useState<any>("user", () => null);
  // @ts-ignore
  const isAuthenticated = computed(() => !!user.value);

  /**
   * Initie le flux d'authentification OAuth2/OpenID
   * Redirige l'utilisateur vers la page de connexion EirbConnect
   */
  const login = () => {
    // Générer un state aléatoire pour la sécurité CSRF
    const state = generateRandomString(32);
    sessionStorage.setItem("oauth_state", state);

    // Construire l'URL d'autorisation
    const authUrl = new URL(
      `${OPENID_CONFIG.serverUrl}/protocol/openid-connect/auth`,
    );
    authUrl.searchParams.append("client_id", OPENID_CONFIG.clientId);
    authUrl.searchParams.append("redirect_uri", OPENID_CONFIG.redirectUri);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("scope", "openid profile email");
    authUrl.searchParams.append("state", state);

    // Rediriger vers EirbConnect
    window.location.href = authUrl.toString();
  };

  /**
   * Traite le callback OAuth après la redirection depuis EirbConnect
   */
  const handleCallback = async (code: string, state: string) => {
    // Vérifier le state pour prévenir les attaques CSRF
    const savedState = sessionStorage.getItem("oauth_state");
    if (state !== savedState) {
      throw new Error("Invalid state parameter");
    }
    sessionStorage.removeItem("oauth_state");

    try {
      // Échanger le code contre un token via notre backend
      // Cela évite les problèmes CORS et garde le client_secret sécurisé
      const response = await fetch(`${API_BASE}/auth/callback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code,
          redirectUri: OPENID_CONFIG.redirectUri,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Failed to exchange code for token",
        );
      }

      const data = await response.json();

      // Stocker le token
      localStorage.setItem("access_token", data.access_token);
      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token);
      }

      // Stocker les informations utilisateur
      user.value = data.user;
      localStorage.setItem("user", JSON.stringify(data.user));

      return data;
    } catch (error) {
      console.error("Error during authentication:", error);

      // Fournir un message plus explicite pour les erreurs réseau
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        throw new Error(
          "Impossible de contacter le serveur backend. Assurez-vous que le backend est démarré sur le port 3000.",
        );
      }

      throw error;
    }
  };

  /**
   * Déconnexion de l'utilisateur
   */
  const logout = () => {
    // Construire l'URL de déconnexion
    const logoutUrl = new URL(
      `${OPENID_CONFIG.serverUrl}/protocol/openid-connect/logout`,
    );
    const redirectUri =
      typeof window !== "undefined" ? window.location.origin : "";
    logoutUrl.searchParams.append("redirect_uri", redirectUri);

    // Nettoyer le stockage local
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    user.value = null;

    // Rediriger vers la page de déconnexion d'EirbConnect
    window.location.href = logoutUrl.toString();
  };

  /**
   * Vérifie si l'utilisateur est déjà authentifié au chargement
   */
  const checkAuth = async () => {
    const token = localStorage.getItem("access_token");
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser);
      } catch (error) {
        console.error("Error parsing saved user:", error);
        // Nettoyer si le JSON est invalide
        localStorage.removeItem("user");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
    }

    // Note: La validation du token se fera lors de la prochaine requête API
    // Si le token est expiré, le backend renverra une erreur 401
  };

  /**
   * Génère une chaîne aléatoire pour le state OAuth
   */
  const generateRandomString = (length: number): string => {
    const charset =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const values = new Uint8Array(length);
    crypto.getRandomValues(values);
    for (let i = 0; i < length; i++) {
      result += charset[values[i] % charset.length];
    }
    return result;
  };

  return {
    user,
    isAuthenticated,
    login,
    logout,
    handleCallback,
    checkAuth,
  };
};
