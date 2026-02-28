const express = require("express");
const router = express.Router();
const mobiliteController = require("../controllers/mobiliteController");
const { authenticateJWT } = require("../middlewares/index");

/**
 * Routes pour la ressource Mobilité
 * Base: /api/v1/mobilites
 */

// GET /api/v1/mobilites - Récupère toutes les mobilités
router.get("/", authenticateJWT, mobiliteController.getAllMobilites);

// GET /api/v1/mobilites/:id - Récupérer une mobilité par son ID
router.get("/:id", authenticateJWT, mobiliteController.getMobiliteById);

// TODO DELETE /api/v1/mobilites/:id - Supprimer une mobilité par son ID
router.delete("/:id", authenticateJWT, mobiliteController.deleteMobiliteById);

// TODO POST /api/v1/mobilites - Créer une nouvelle mobilité
router.post("/", authenticateJWT, mobiliteController.createMobilite);

module.exports = router;
