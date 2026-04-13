const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { getStepEstimation } = require("../utils/emissionDatas");

/**
 * GET /api/v1/trips/{tripId}/steps
 * Get the list of steps for a trip
 */
async function getSteps(req, res) {
  try {
    const { tripId } = req.params;
    const userId = req.user.id;

    if (!tripId) {
      return res.status(400).json({ error: "Trip ID is required" });
    }

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        mobility: { select: { userId: true } },
      },
    });

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    if (trip.mobility.userId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
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
        metadata: true,
      },
    });

    res.json(steps.map((s) => ({ id: s.id, ...s })));
  } catch (error) {
    console.error("Error fetching steps:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * POST /api/v1/trips/{tripId}/steps
 * Create a new step for a trip (no request body required)
 */
async function createStep(req, res) {
  try {
    const { tripId } = req.params;
    const userId = req.user.id;

    if (!tripId) {
      return res.status(400).json({ error: "Trip ID is required" });
    }

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        mobility: { select: { userId: true } },
      },
    });

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    if (trip.mobility.userId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
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
        metadata: true,
      },
    });

    res.status(201).json({ id: created.id, ...created });
  } catch (error) {
    console.error("Error creating step:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * GET /api/v1/steps/{id}
 * Get a step by ID
 */
async function getStep(req, res) {
  try {
    const { stepId } = req.params;
    const userId = req.user.id;

    if (!stepId) {
      return res.status(400).json({ error: "Step ID is required" });
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
      return res.status(404).json({ error: "Step not found" });
    }

    if (step.trip.mobility.userId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { trip, ...stepData } = step;
    res.json({ id: stepData.id, ...stepData });
  } catch (error) {
    console.error("Error fetching step:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * DELETE /api/v1/steps/{id}
 * Delete a step by ID
 */
async function deleteStep(req, res) {
  try {
    const { stepId } = req.params;
    const userId = req.user.id;

    if (!stepId) {
      return res.status(400).json({ error: "Step ID is required" });
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
      return res.status(404).json({ error: "Step not found" });
    }

    if (step.trip.mobility.userId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await prisma.step.delete({ where: { id: stepId } });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting step:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * PATCH /api/v1/steps/{id}
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
      return res.status(404).json({ error: "Step not found" });
    }

    if (step.trip.mobility.userId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { labelStart, labelEnd, transportMode, metadata, sequenceOrder } = req.body;
    
    let updateData = {
      labelStart: labelStart !== undefined ? labelStart : step.labelStart,
      labelEnd: labelEnd !== undefined ? labelEnd : step.labelEnd,
      transportMode: transportMode !== undefined ? transportMode : step.transportMode,
      metadata: metadata !== undefined ? metadata : step.metadata,
      sequenceOrder: sequenceOrder !== undefined ? sequenceOrder : step.sequenceOrder
    };

    const hasNewInput = labelStart || labelEnd || transportMode;
    const hasRequiredData = updateData.labelStart && updateData.labelEnd && updateData.transportMode;

    if (hasRequiredData && hasNewInput) {
      try {
        const estimation = await getStepEstimation({
          origin: updateData.labelStart,
          destination: updateData.labelEnd,
          transportMode: updateData.transportMode
        });
        updateData.carbon = estimation.carbon;
        updateData.distance = estimation.distance;
        updateData.time = estimation.time;
      } catch (err) {
        console.error("Error during estimation:", err.message);
        return res.status(400).json({ 
          error: "Erreur lors du calcul",
          details: err.message 
        });
      }      
    }

    const updated = await prisma.step.update({
      where: { id: stepId },
      data: updateData,
      select: { 
        id: true,
        labelStart: true,
        labelEnd: true,
        transportMode: true,
        carbon: true,
        distance: true,
        time: true,
        metadata: true
      },
    });
    res.json({ id: updated.id, ...updated });
  } catch (error) {
    console.error("Error updating step:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  getSteps,
  createStep,
  getStep,
  deleteStep,
  updateStep,
};
