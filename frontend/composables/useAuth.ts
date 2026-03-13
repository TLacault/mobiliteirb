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
  const API_BASE = config.public.apiBase || "/api/v1";
  const SILENT_LOGIN_FLAG = "oauth_silent_login_pending";
  const SILENT_LOGIN_DISABLED_FLAG = "oauth_silent_login_disabled";

  // État de l'utilisateur (réactif)
  // @ts-ignore
  const user = useState<any>("user", () => null);
  // @ts-ignore
  const isAuthenticated = computed(() => !!user.value);

  const clearLocalAuth = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    user.value = null;
  };

  const decodeJwtPayload = (token: string): any | null => {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;
      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
      return JSON.parse(atob(padded));
    } catch {
      return null;
    }
  };

  const isTokenUsable = (token: string, minValiditySeconds = 30): boolean => {
    const payload = decodeJwtPayload(token);
    if (!payload || !payload.exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return now < payload.exp - minValiditySeconds;
  };

  const refreshAccessToken = async (): Promise<string | null> => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      if (!data?.access_token) return null;

      localStorage.setItem("access_token", data.access_token);
      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token);
      }
      return data.access_token;
    } catch {
      return null;
    }
  };

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

    // Évite tout conflit avec un précédent silent login
    sessionStorage.removeItem(SILENT_LOGIN_FLAG);
    sessionStorage.removeItem(SILENT_LOGIN_DISABLED_FLAG);

    // Rediriger vers EirbConnect
    window.location.href = authUrl.toString();
  };

  /**
   * Tente une connexion silencieuse (prompt=none) si l'utilisateur
   * a déjà une session active côté EirbConnect.
   */
  const trySilentLogin = async () => {
    const token = localStorage.getItem("access_token");
    if (token && isTokenUsable(token)) return false;

    if (sessionStorage.getItem(SILENT_LOGIN_FLAG) === "1") return false;
    if (sessionStorage.getItem(SILENT_LOGIN_DISABLED_FLAG) === "1") {
      return false;
    }

    const state = generateRandomString(32);
    sessionStorage.setItem("oauth_state", state);
    sessionStorage.setItem(SILENT_LOGIN_FLAG, "1");

    const authUrl = new URL(
      `${OPENID_CONFIG.serverUrl}/protocol/openid-connect/auth`,
    );
    authUrl.searchParams.append("client_id", OPENID_CONFIG.clientId);
    authUrl.searchParams.append("redirect_uri", OPENID_CONFIG.redirectUri);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("scope", "openid profile email");
    authUrl.searchParams.append("state", state);
    authUrl.searchParams.append("prompt", "none");

    window.location.href = authUrl.toString();
    return true;
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
      sessionStorage.removeItem(SILENT_LOGIN_FLAG);
      sessionStorage.removeItem(SILENT_LOGIN_DISABLED_FLAG);

      return data;
    } catch (error) {
      console.error("Error during authentication:", error);

      // Fournir un message plus explicite pour les erreurs réseau
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        throw new Error(
          "Impossible de contacter le serveur backend. Vérifiez que l'API est démarrée et accessible.",
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
    clearLocalAuth();
    sessionStorage.removeItem(SILENT_LOGIN_FLAG);
    // Après un logout volontaire, on évite l'auto silent-login qui peut recréer une boucle.
    sessionStorage.setItem(SILENT_LOGIN_DISABLED_FLAG, "1");

    // Rediriger vers la page de déconnexion d'EirbConnect
    window.location.href = logoutUrl.toString();
  };

  /**
   * Vérifie si l'utilisateur est déjà authentifié au chargement
   */
  const checkAuth = async () => {
    const token = localStorage.getItem("access_token");
    const savedUser = localStorage.getItem("user");

    if (!token) {
      clearLocalAuth();
      return false;
    }

    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser);
      } catch (error) {
        console.error("Error parsing saved user:", error);
        clearLocalAuth();
        return false;
      }
    }

    // Token encore valide
    if (isTokenUsable(token)) {
      if (!user.value) {
        const payload = decodeJwtPayload(token);
        if (payload) {
          user.value = {
            preferred_username: payload.preferred_username || "",
            email: payload.email || null,
          };
          localStorage.setItem("user", JSON.stringify(user.value));
        }
      }
      return !!user.value;
    }

    // Token expiré: tenter refresh pour éviter faux état connecté
    const refreshed = await refreshAccessToken();
    if (!refreshed || !isTokenUsable(refreshed)) {
      clearLocalAuth();
      return false;
    }

    // Si user absent mais token valide, reconstruire un profil minimal
    if (!user.value) {
      const payload = decodeJwtPayload(refreshed);
      if (payload) {
        user.value = {
          preferred_username: payload.preferred_username || "",
          email: payload.email || null,
        };
        localStorage.setItem("user", JSON.stringify(user.value));
      }
    }

    return !!user.value;
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
    trySilentLogin,
  };
};
