const express = require("express");
const router = express.Router();
const tripController = require("../controllers/tripController");
const { authenticateJWT } = require("../middlewares/index");

/**
 * Routes for the Trip resource
 * Base: /api/v1/trips
 */

// GET /api/v1/trips/:tripId - Get a trip by ID
router.get("/:tripId", authenticateJWT, tripController.getTripStats);

// PATCH /api/v1/trips/:tripId - Update a trip by ID
router.patch("/:tripId", authenticateJWT, tripController.updateTripStats);

// DELETE /api/v1/trips/:tripId - Delete a trip by ID
router.delete("/:tripId", authenticateJWT, tripController.deleteTrip);

module.exports = router;
