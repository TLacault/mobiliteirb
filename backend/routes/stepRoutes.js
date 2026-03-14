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
 * /steps/{stepId}:
 *   get:
 *     summary: Get a step by ID
 *     tags: [Steps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stepId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Step UUID
 *     responses:
 *       200:
 *         description: Step details
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
 * /steps/{stepId}:
 *   delete:
 *     summary: Delete a step by ID
 *     tags: [Steps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stepId
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

module.exports = router;
