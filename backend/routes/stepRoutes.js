const express = require("express");
const router = express.Router();
const stepController = require("../controllers/stepController");
const { authenticateJWT } = require("../middlewares/index");

/**
 * @openapi
 * tags:
 *   - name: Steps
 *     description: Step management
 */

/**
 * @openapi
 * /steps/{id}:
 *   get:
 *     summary: Get a step by ID
 *     tags: [Steps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Step UUID
 *     responses:
 *       200:
 *         description: Step details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 sequenceOrder:
 *                   type: number
 *                 transportMode:
 *                   type: string
 *                 carbon:
 *                   type: number
 *                 distance:
 *                   type: number
 *                 time:
 *                   type: number
 *                 labelStart:
 *                   type: string
 *                 labelEnd:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Step not found
 */
router.get("/:stepId", authenticateJWT, stepController.getStep);

/**
 * @openapi
 * /steps/{id}:
 *   delete:
 *     summary: Delete a step by ID
 *     tags: [Steps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Step UUID
 *     responses:
 *       204:
 *         description: Step deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Step not found
 */
router.delete("/:stepId", authenticateJWT, stepController.deleteStep);

/**
 * @openapi
 * /steps/{id}:
 *   patch:
 *     summary: Update a step's editable fields
 *     tags: [Steps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Step UUID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               labelStart:
 *                 type: string
 *               labelEnd:
 *                 type: string
 *               transportMode:
 *                 type: string
 *               sequenceOrder:
 *                 type: number
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Updated step
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Step not found
 */
router.patch("/:stepId", authenticateJWT, stepController.updateStep);

module.exports = router;
