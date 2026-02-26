const express = require("express");
const router = express.Router();
const mobiliteController = require("../controllers/mobiliteController");

/**
 * Routes pour la ressource Mobilité
 * Base: /api/v1/mobilites
 */

// GET /api/v1/mobilites - Récupère toutes les mobilités
router.get("/", mobiliteController.getAllMobilites);

// TODO GET /api/v1/mobilites/:id - Récupérer une mobilité par son ID

// TODO DELETE /api/v1/mobilites/:id - Supprimer une mobilité par son ID

// TODO POST /api/v1/mobilites - Créer une nouvelle mobilité

module.exports = router;
