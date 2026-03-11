const express = require("express");
const router = express.Router();
const tripController = require("../controllers/tripController");
const { authenticateJWT } = require("../middlewares/index");

/**
 * @openapi
 * tags:
 *   - name: Trips
 *     description: Trip management
 */

/**
 * @openapi
 * /trips/{tripId}:
 *   get:
 *     summary: Get a trip by ID
 *     tags: [Trips]
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
 *         description: Trip details and stats
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Trip'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Trip not found
 */
router.get("/:tripId", authenticateJWT, tripController.getTrip);

/**
 * @openapi
 * /trips/{tripId}:
 *   patch:
 *     summary: Partially update a trip
 *     tags: [Trips]
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 trip:
 *                   $ref: '#/components/schemas/Trip'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Trip not found
 */
router.patch("/:tripId", authenticateJWT, tripController.updateTrip);

/**
 * @openapi
 * /trips/{tripId}:
 *   delete:
 *     summary: Delete a trip
 *     tags: [Trips]
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
 *         description: Trip deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Trip not found
 */
router.delete("/:tripId", authenticateJWT, tripController.deleteTrip);

module.exports = router;
