const express = require("express");
const router = express.Router();
const mobilityController = require("../controllers/mobilityController");
const tripController = require("../controllers/tripController");
const { authenticateJWT } = require("../middlewares/index");

/**
 * @openapi
 * tags:
 *   - name: Mobilities
 *     description: Mobility management
 */

/**
 * @openapi
 * /mobilities:
 *   get:
 *     summary: List user mobilities
 *     tags: [Mobilities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of mobility IDs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *       401:
 *         description: Unauthorized
 */
router.get("/", authenticateJWT, mobilityController.getMobilities);

/**
 * @openapi
 * /mobilities:
 *   post:
 *     summary: Create a new mobility
 *     tags: [Mobilities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, year, startLocation, endLocation]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Erasmus 2024
 *               year:
 *                 type: string
 *                 format: date
 *                 example: '2024'
 *               startLocation:
 *                 type: string
 *                 example: Paris, France
 *               endLocation:
 *                 type: string
 *                 example: Berlin, Germany
 *               isPublic:
 *                 type: boolean
 *               isOriginal:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Mobility created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 */
router.post("/", authenticateJWT, mobilityController.createMobility);

/**
 * @openapi
 * /mobilities/searchMobilty:
 *   get:
 *     summary: Search mobilities
 *     tags: [Mobilities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: false
 *         schema:
 *           type: string
 *         description: Global text search on departure and arrival
 *       - in: query
 *         name: departure
 *         required: false
 *         schema:
 *           type: string
 *         description: Departure location filter
 *       - in: query
 *         name: arrival
 *         required: false
 *         schema:
 *           type: string
 *         description: Arrival location filter
 *       - in: query
 *         name: transportModes
 *         required: false
 *         schema:
 *           type: string
 *         description: Comma-separated list of transport modes
 *       - in: query
 *         name: minCarbon
 *         required: false
 *         schema:
 *           type: number
 *           minimum: 0
 *       - in: query
 *         name: maxCarbon
 *         required: false
 *         schema:
 *           type: number
 *           minimum: 0
 *       - in: query
 *         name: minTime
 *         required: false
 *         schema:
 *           type: number
 *           minimum: 0
 *       - in: query
 *         name: maxTime
 *         required: false
 *         schema:
 *           type: number
 *           minimum: 0
 *       - in: query
 *         name: minDistance
 *         required: false
 *         schema:
 *           type: number
 *           minimum: 0
 *       - in: query
 *         name: maxDistance
 *         required: false
 *         schema:
 *           type: number
 *           minimum: 0
 *       - in: query
 *         name: minSteps
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 0
 *       - in: query
 *         name: maxSteps
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 0
 *       - in: query
 *         name: order
 *         required: false
 *         schema:
 *           type: string
 *           enum: [lastEdit_desc, lastEdit_asc, name_asc, name_desc, year_desc, year_asc]
 *         description: Sort order for mobilities
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number (10 results per page)
 *     responses:
 *       200:
 *         description: Matching mobilities and pagination
 *       401:
 *         description: Unauthorized
 */
router.get("/searchMobilty", authenticateJWT, mobilityController.searchMobilty);

/**
 * @openapi
 * /mobilities/{id}:
 *   get:
 *     summary: Get a mobility by ID
 *     tags: [Mobilities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Mobility UUID
 *     responses:
 *       200:
 *         description: Mobility properties
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 year:
 *                   type: string
 *                 startLocation:
 *                   type: string
 *                 endLocation:
 *                   type: string
 *                 isPublic:
 *                   type: boolean
 *                 isOriginal:
 *                   type: boolean
 *                 lastEdit:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Mobility not found
 */
router.get("/:id", authenticateJWT, mobilityController.getMobility);

/**
 * @openapi
 * /mobilities/{id}/stats:
 *   get:
 *     summary: Get mobility statistics from selected trips
 *     tags: [Mobilities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Mobility UUID
 *     responses:
 *       200:
 *         description: Aggregated statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalCarbon:
 *                   type: number
 *                 totalDistance:
 *                   type: number
 *                 totalTime:
 *                   type: number
 *                 stepCount:
 *                   type: number
 *                 tripCount:
 *                   type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Mobility not found
 */
router.get("/:id/stats", authenticateJWT, mobilityController.getMobilityStats);

/**
 * @openapi
 * /mobilities/{id}:
 *   patch:
 *     summary: Partially update a mobility
 *     tags: [Mobilities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Mobility UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               year:
 *                 type: string
 *                 format: date
 *               isPublic:
 *                 type: boolean
 *               startLocation:
 *                 type: string
 *               endLocation:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mobility updated
 *       400:
 *         description: No valid fields to update or invalid year format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Mobility not found
 */
router.patch("/:id", authenticateJWT, mobilityController.updateMobility);

/**
 * @openapi
 * /mobilities/{id}:
 *   delete:
 *     summary: Delete a mobility
 *     tags: [Mobilities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Mobility UUID
 *     responses:
 *       204:
 *         description: Mobility deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Mobility not found
 */
router.delete("/:id", authenticateJWT, mobilityController.deleteMobility);

/**
 * @openapi
 * /mobilities/{id}/trips:
 *   get:
 *     summary: List trips for a mobility
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Mobility UUID
 *       - in: query
 *         name: order
 *         required: false
 *         schema:
 *           type: string
 *           enum: [createdAt, alpha_desc, alpha_asc, emissions_desc, emissions_asc, duration_desc, duration_asc, distance_desc, distance_asc, steps_desc, steps_asc]
 *         description: Sort order for trips
 *     responses:
 *       200:
 *         description: Array of trip IDs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Mobility not found
 */
router.get("/:id/trips", authenticateJWT, tripController.getTrips);

/**
 * @openapi
 * /mobilities/{id}/trips:
 *   post:
 *     summary: Create a new trip for a mobility
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Mobility UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Outbound flight
 *     responses:
 *       201:
 *         description: Trip created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Mobility not found
 */
router.post("/:id/trips", authenticateJWT, tripController.createTrip);

module.exports = router;
