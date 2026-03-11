const express = require("express");
const router = express.Router();
const mobiliteController = require("../controllers/mobiliteController");
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
 *         description: Array of mobility UUIDs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UuidResponse'
 *       401:
 *         description: Unauthorized
 */
router.get("/", authenticateJWT, mobiliteController.getAllMobilites);

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
 *                 example: '2024-01-01'
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
 *               $ref: '#/components/schemas/UuidResponse'
 *       401:
 *         description: Unauthorized
 */
router.post("/", authenticateJWT, mobiliteController.createMobilite);

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
 *         description: Mobility details with stats
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Mobility'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Mobility not found
 */
router.get("/:id", authenticateJWT, mobiliteController.getMobiliteById);

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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Mobility not found
 */
router.patch("/:id", authenticateJWT, mobiliteController.patchMobiliteById);

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
 *       200:
 *         description: Mobility deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Mobility not found
 */
router.delete("/:id", authenticateJWT, mobiliteController.deleteMobiliteById);

/**
 * @openapi
 * /mobilities/{id}/trips:
 *   get:
 *     summary: List trips for a mobility
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
 *         description: Array of trip UUIDs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UuidResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Mobility not found
 */
router.get("/:id/trips", authenticateJWT, tripController.getTrips);

module.exports = router;
