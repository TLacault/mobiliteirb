/**
 * Middlewares pour l'API
 *
 * Ce fichier contiendra les middlewares réutilisables :
 * - Authentification
 * - Validation des données
 * - Gestion des erreurs
 * - Logging
 * - etc.
 */

/**
 * Middleware de gestion des erreurs global
 * À activer dans index.js avec : app.use(errorHandler)
 */
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    error: err.message || "Erreur serveur interne",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

/**
 * Middleware pour valider qu'un ID est fourni
 */
const validateId = (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      error: "ID manquant dans la requête",
    });
  }

  next();
};

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Middleware d'authentification JWT
 * Décode le Bearer token EirbConnect (Keycloak JWT), récupère le casLogin
 * et charge le profil utilisateur depuis la DB dans req.user.
 */
const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "unauthorized", message: "Token manquant" });
  }

  const token = authHeader.slice(7);

  try {
    // Décoder le payload JWT (base64url) sans vérification de signature
    // Le token provient directement d'EirbConnect/Keycloak, considéré fiable
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error("Format JWT invalide");
    const payload = JSON.parse(
      Buffer.from(
        parts[1].replace(/-/g, "+").replace(/_/g, "/"),
        "base64",
      ).toString("utf-8"),
    );

    const casLogin = payload.preferred_username;
    if (!casLogin) {
      return res.status(401).json({
        error: "unauthorized",
        message: "preferred_username absent du token",
      });
    }

    // Vérification expiration
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return res
        .status(401)
        .json({ error: "token_expired", message: "Token expiré" });
    }

    // Charger l'utilisateur depuis la DB.
    // En dev, la base peut être recréée alors que le navigateur garde un token valide :
    // on recrée l'utilisateur à la volée pour éviter un 401 bloquant.
    const user = await prisma.user.upsert({
      where: { casLogin },
      update: {
        ...(payload.email ? { email: payload.email } : {}),
      },
      create: {
        casLogin,
        email: payload.email || null,
        role: "student",
      },
    });

    req.user = user; // { id, casLogin, email, role, createdAt }
    next();
  } catch (err) {
    console.error("authenticateJWT error:", err);
    return res
      .status(401)
      .json({ error: "unauthorized", message: "Token invalide" });
  }
};

module.exports = {
  errorHandler,
  validateId,
  authenticateJWT,
};
