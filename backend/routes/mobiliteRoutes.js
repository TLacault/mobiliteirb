const express = require("express");
const router = express.Router();
const mobiliteController = require("../controllers/mobiliteController");

/**
 * Routes pour la ressource Mobilité
 * Base: /api/v1/mobilites
 */

// GET /api/v1/mobilites - Récupère toutes les mobilités
router.get("/", mobiliteController.getAllMobilites);

// GET /api/v1/mobilites/:id - Récupère une mobilité par ID
router.get("/:id", mobiliteController.getMobiliteById);

// POST /api/v1/mobilites - Crée une nouvelle mobilité
router.post("/", mobiliteController.createMobilite);

// DELETE /api/v1/mobilites/:id - Supprime une mobilité
router.delete("/:id", mobiliteController.deleteMobilite);

module.exports = router;
