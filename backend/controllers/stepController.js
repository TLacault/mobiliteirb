const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Controller pour la gestion des steps
 */

/**
 * GET /api/v1/trips/:tripId/steps
 * Get the list of steps for a trip
 */
async function getStepsByTrip(req, res) {
  try {
    const { tripId } = req.params;
    const userId = req.user.id;

    if (!tripId) {
      return res.status(400).json({ error: "ID trajet manquant" });
    }

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        mobility: { select: { userId: true } },
      },
    });

    if (!trip) {
      return res.status(404).json({ error: "Trajet introuvable" });
    }

    if (trip.mobility.userId !== userId) {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    const steps = await prisma.step.findMany({
      where: { tripId },
      orderBy: { sequenceOrder: "asc" },
      select: {
        id: true,
        sequenceOrder: true,
        transportMode: true,
        carbon: true,
        distance: true,
        time: true,
        labelStart: true,
        labelEnd: true,
      },
    });

    res.json(steps.map((s) => ({ uuid: s.id, ...s })));
  } catch (error) {
    console.error("Erreur lors de la récupération des steps :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

/**
 * POST /api/v1/trips/:tripId/steps
 * Create a new step for a trip (no request body required)
 */
async function createStepByTrip(req, res) {
  try {
    const { tripId } = req.params;
    const userId = req.user.id;

    if (!tripId) {
      return res.status(400).json({ error: "ID trajet manquant" });
    }

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        mobility: { select: { userId: true } },
      },
    });

    if (!trip) {
      return res.status(404).json({ error: "Trajet introuvable" });
    }

    if (trip.mobility.userId !== userId) {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    const lastStep = await prisma.step.findFirst({
      where: { tripId },
      orderBy: { sequenceOrder: "desc" },
      select: { sequenceOrder: true },
    });

    const nextSequenceOrder = (lastStep?.sequenceOrder ?? 0) + 1;

    const created = await prisma.step.create({
      data: {
        tripId,
        sequenceOrder: nextSequenceOrder,
      },
      select: {
        id: true,
        sequenceOrder: true,
        transportMode: true,
        carbon: true,
        distance: true,
        time: true,
        labelStart: true,
        labelEnd: true,
      },
    });

    res.status(201).json({ uuid: created.id, ...created });
  } catch (error) {
    console.error("Erreur lors de la création du step :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

/**
 * GET /api/v1/steps/:stepId
 * Get a step by ID
 */
async function getStep(req, res) {
  try {
    const { stepId } = req.params;
    const userId = req.user.id;

    if (!stepId) {
      return res.status(400).json({ error: "ID step manquant" });
    }

    const step = await prisma.step.findUnique({
      where: { id: stepId },
      include: {
        trip: {
          include: {
            mobility: { select: { userId: true } },
          },
        },
      },
    });

    if (!step) {
      return res.status(404).json({ error: "Step introuvable" });
    }

    if (step.trip.mobility.userId !== userId) {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    const { trip, ...stepData } = step;
    res.json({ uuid: stepData.id, ...stepData });
  } catch (error) {
    console.error("Erreur lors de la récupération du step :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

/**
 * DELETE /api/v1/steps/:stepId
 * Delete a step by ID
 */
async function deleteStep(req, res) {
  try {
    const { stepId } = req.params;
    const userId = req.user.id;

    if (!stepId) {
      return res.status(400).json({ error: "ID step manquant" });
    }

    const step = await prisma.step.findUnique({
      where: { id: stepId },
      include: {
        trip: {
          include: {
            mobility: { select: { userId: true } },
          },
        },
      },
    });

    if (!step) {
      return res.status(404).json({ error: "Step introuvable" });
    }

    if (step.trip.mobility.userId !== userId) {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    await prisma.step.delete({ where: { id: stepId } });

    res.status(204).send();
  } catch (error) {
    console.error("Erreur lors de la suppression du step :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

/**
 * PATCH /api/v1/steps/:stepId
 * Update editable fields of a step
 */
async function updateStep(req, res) {
  try {
    const { stepId } = req.params;
    const userId = req.user.id;

    const step = await prisma.step.findUnique({
      where: { id: stepId },
      include: {
        trip: {
          include: {
            mobility: { select: { userId: true } },
          },
        },
      },
    });

    if (!step) {
      return res.status(404).json({ error: "Step introuvable" });
    }

    if (step.trip.mobility.userId !== userId) {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    const { labelStart, labelEnd, transportMode, sequenceOrder } = req.body;

    const updated = await prisma.step.update({
      where: { id: stepId },
      data: {
        ...(labelStart !== undefined && { labelStart }),
        ...(labelEnd !== undefined && { labelEnd }),
        ...(transportMode !== undefined && { transportMode }),
        ...(sequenceOrder !== undefined && { sequenceOrder }),
      },
      select: {
        id: true,
        sequenceOrder: true,
        transportMode: true,
        carbon: true,
        distance: true,
        labelStart: true,
        labelEnd: true,
      },
    });

    res.json({ uuid: updated.id, ...updated });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du step :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

module.exports = {
  getStepsByTrip,
  createStepByTrip,
  getStep,
  deleteStep,
  updateStep,
};
