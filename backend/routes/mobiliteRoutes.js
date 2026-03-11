const express = require("express");
const router = express.Router();
const mobiliteController = require("../controllers/mobiliteController");
const tripController = require("../controllers/tripController");
const { authenticateJWT } = require("../middlewares/index");

/**
 * Routes for the Mobility resource
 * Base: /api/v1/mobilities
 */

// GET /api/v1/mobilities - List all mobilities for the authenticated user
router.get("/", authenticateJWT, mobiliteController.getAllMobilites);

// POST /api/v1/mobilities - Create a new mobility
router.post("/", authenticateJWT, mobiliteController.createMobilite);

// GET /api/v1/mobilities/:id - Get a mobility by ID
router.get("/:id", authenticateJWT, mobiliteController.getMobiliteById);

// PATCH /api/v1/mobilities/:id - Update a mobility by ID
router.patch("/:id", authenticateJWT, mobiliteController.patchMobiliteById);

// DELETE /api/v1/mobilities/:id - Delete a mobility by ID
router.delete("/:id", authenticateJWT, mobiliteController.deleteMobiliteById);

// GET /api/v1/mobilities/:id/trips - List all trips for a mobility
router.get("/:id/trips", authenticateJWT, tripController.getTrips);

module.exports = router;
