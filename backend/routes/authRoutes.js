const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// Configuration OpenID EirbConnect
const OPENID_CONFIG = {
  serverUrl: "https://connect.vpn.eirb.fr/realms/eirb",
  clientId: "mobilit",
  clientSecret: "8oG9JgRg5vS2GO7CuM3JiDS5f4IcS1g4", // TODO : RESET + Stocker en variable d'environnement
};

/**
 * POST /api/v1/auth/callback
 * Échange le code d'autorisation contre un token d'accès
 */
router.post("/callback", async (req, res) => {
  try {
    const { code, redirectUri } = req.body;

    if (!code || !redirectUri) {
      return res.status(400).json({
        error: "missing_parameters",
        message: "Code et redirectUri sont requis",
      });
    }

    // Échanger le code contre un token (côté serveur)
    const tokenResponse = await fetch(
      `${OPENID_CONFIG.serverUrl}/protocol/openid-connect/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: code,
          redirect_uri: redirectUri,
          client_id: OPENID_CONFIG.clientId,
          client_secret: OPENID_CONFIG.clientSecret,
        }),
      },
    );

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      return res.status(tokenResponse.status).json({
        error: "token_exchange_failed",
        message:
          errorData.error_description || "Failed to exchange code for token",
        details: errorData,
      });
    }

    const tokens = await tokenResponse.json();

    // Récupérer les informations de l'utilisateur
    const userInfoResponse = await fetch(
      `${OPENID_CONFIG.serverUrl}/protocol/openid-connect/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      },
    );

    if (!userInfoResponse.ok) {
      return res.status(userInfoResponse.status).json({
        error: "userinfo_failed",
        message: "Failed to fetch user info",
      });
    }

    const userInfo = await userInfoResponse.json();

    // Identifier le login CAS (preferred_username fourni par EirbConnect/Keycloak)
    const casLogin = userInfo.preferred_username;
    if (!casLogin) {
      return res.status(400).json({
        error: "missing_cas_login",
        message: "Le champ preferred_username est absent du token EirbConnect",
      });
    }

    // Chercher l'utilisateur en base ou le créer s'il n'existe pas encore
    const dbUser = await prisma.user.upsert({
      where: { casLogin },
      update: {
        // Mettre à jour l'email si le provider en fournit un nouveau
        ...(userInfo.email ? { email: userInfo.email } : {}),
      },
      create: {
        casLogin,
        email: userInfo.email || null,
        role: "student",
      },
    });

    // Retourner les tokens et les infos utilisateur (DB + OpenID)
    res.json({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      user: {
        ...userInfo,
        dbId: dbUser.id,
        role: dbUser.role,
      },
    });
  } catch (error) {
    console.error("Auth callback error:", error);
    res.status(500).json({
      error: "internal_server_error",
      message:
        error.message || "Une erreur s'est produite lors de l'authentification",
    });
  }
});

/**
 * POST /api/v1/auth/refresh
 * Rafraîchit un access token
 */
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: "missing_parameters",
        message: "Refresh token requis",
      });
    }

    const tokenResponse = await fetch(
      `${OPENID_CONFIG.serverUrl}/protocol/openid-connect/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: OPENID_CONFIG.clientId,
          client_secret: OPENID_CONFIG.clientSecret,
        }),
      },
    );

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      return res.status(tokenResponse.status).json({
        error: "token_refresh_failed",
        message: errorData.error_description || "Failed to refresh token",
      });
    }

    const tokens = await tokenResponse.json();

    res.json({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(500).json({
      error: "internal_server_error",
      message: "Une erreur s'est produite lors du rafraîchissement du token",
    });
  }
});

module.exports = router;
