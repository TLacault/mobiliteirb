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

/**
 * TODO: Middleware d'authentification JWT
 * À implémenter une fois le système d'authentification en place
 */
const authenticateJWT = (req, res, next) => {
  // const token = req.headers.authorization?.split(' ')[1];
  // Validation du token...
  next();
};

module.exports = {
  errorHandler,
  validateId,
  authenticateJWT,
};
