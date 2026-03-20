const express = require("express");
const router = express.Router();
const tripController = require("../controllers/tripController");
const stepController = require("../controllers/stepController");
const { authenticateJWT } = require("../middlewares/index");

/**
 * @openapi
 * tags:
 *   - name: Trips
 *     description: Trip management
 */

/**
 * @openapi
 * /trips/{id}:
 *   get:
 *     summary: Get a trip by ID
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
 *         description: Trip UUID
 *     responses:
 *       200:
 *         description: Trip properties
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 isSelected:
 *                   type: boolean
 *                 mobilityId:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Trip not found
 */
router.get("/:tripId", authenticateJWT, tripController.getTrip);

/**
 * @openapi
 * /trips/{id}/stats:
 *   get:
 *     summary: Get trip statistics
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
 *         description: Trip UUID
 *     responses:
 *       200:
 *         description: Trip statistics
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Trip not found
 */
router.get(
  "/:tripId/stats",
  authenticateJWT,
  tripController.getTripStatsHandler,
);

/**
 * @openapi
 * /trips/{id}:
 *   patch:
 *     summary: Partially update a trip
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
 *         description: Trip UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Outbound flight
 *               isSelected:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Trip updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Trip not found
 */
router.patch("/:tripId", authenticateJWT, tripController.updateTrip);

/**
 * @openapi
 * /trips/{id}:
 *   delete:
 *     summary: Delete a trip
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
 *         description: Trip UUID
 *     responses:
 *       204:
 *         description: Trip deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Trip not found
 */
router.delete("/:tripId", authenticateJWT, tripController.deleteTrip);

/**
 * @openapi
 * /trips/{tripId}/steps:
 *   get:
 *     summary: List steps for a trip
 *     tags: [Steps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Trip UUID
 *     responses:
 *       200:
 *         description: List of steps
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   sequenceOrder:
 *                     type: number
 *                   transportMode:
 *                     type: string
 *                   carbon:
 *                     type: number
 *                   distance:
 *                     type: number
 *                   time:
 *                     type: number
 *                   labelStart:
 *                     type: string
 *                   labelEnd:
 *                     type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Trip not found
 */
router.get("/:tripId/steps", authenticateJWT, stepController.getSteps);

/**
 * @openapi
 * /trips/{tripId}/steps:
 *   post:
 *     summary: Create a new step for a trip
 *     tags: [Steps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Trip UUID
 *     responses:
 *       201:
 *         description: Step created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 sequenceOrder:
 *                   type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Trip not found
 */
router.post("/:tripId/steps", authenticateJWT, stepController.createStep);

module.exports = router;
