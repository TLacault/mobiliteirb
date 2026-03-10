const express = require("express");
const router = express.Router();
const tripController = require("../controllers/tripController");
const { authenticateJWT } = require("../middlewares/index");

/**
 * Routes pour la ressource Trajet
 * Base: /api/v1/trips
 */

// GET /api/v1/trips/mobility/:mobiliteId - Récupère tous les trajets d'une mobilité
router.get("/mobility/:mobiliteId", authenticateJWT, tripController.getAllTrips);

// GET /api/v1/trips/:tripId - Récupère les stats d'un trajet spécifique
router.get("/:tripId", authenticateJWT, tripController.getTripStats);

// PATCH /api/v1/trips/:tripId - Met à jour les stats d'un trajet spécifique
router.patch("/:tripId", authenticateJWT, tripController.updateTripStats);

// DELETE /api/v1/trips/:tripId - Supprimer un trajet par son ID (TODO)
router.delete("/:tripId", authenticateJWT, tripController.deleteTrip);

module.exports = router;
