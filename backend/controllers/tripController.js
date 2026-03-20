const { PrismaClient } = require("@prisma/client");
const { calculateStepsStats } = require("../utils/stats");

const prisma = new PrismaClient();

function isMissingStepTimeColumnError(error) {
  if (!error || error.code !== "P2022") return false;
  const target = error?.meta?.column || error?.meta?.target || "";
  return String(target).toLowerCase().includes("time");
}

function getStepDuration(step) {
  if (step?.time !== undefined && step?.time !== null) {
    const value = Number(step.time);
    if (Number.isFinite(value)) return value;
  }

  const metadataDuration = Number(step?.metadata?.duration);
  if (Number.isFinite(metadataDuration)) return metadataDuration;

  return 0;
}

/**
 * GET /api/v1/mobilities/{mobilityId}/trips
 * Get the list of trips for a mobility
 */
async function getTrips(req, res) {
  try {
    const mobilityId = req.params.id;
    const userId = req.user.id;
    const requestedOrder =
      typeof req.query.order === "string" ? req.query.order : "createdAt";

    const allowedOrders = [
      "createdAt",
      "alpha_desc",
      "alpha_asc",
      "emissions_desc",
      "emissions_asc",
      "duration_desc",
      "duration_asc",
      "distance_desc",
      "distance_asc",
      "steps_desc",
      "steps_asc",
    ];
    const order = allowedOrders.includes(requestedOrder)
      ? requestedOrder
      : "createdAt";

    if (!mobilityId) {
      return res.status(400).json({ error: "Mobility ID is required" });
    }

    const mobility = await prisma.mobility.findUnique({
      where: { id: mobilityId },
      select: { id: true, userId: true },
    });

    if (!mobility) {
      return res.status(404).json({ error: "Mobility not found" });
    }

    if (mobility.userId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    let trips;
    try {
      trips = await prisma.trip.findMany({
        where: { mobilityId: mobilityId },
        select: {
          id: true,
          name: true,
          steps: {
            select: {
              carbon: true,
              distance: true,
              time: true,
              metadata: true,
            },
          },
        },
      });
    } catch (error) {
      if (!isMissingStepTimeColumnError(error)) {
        throw error;
      }

      trips = await prisma.trip.findMany({
        where: { mobilityId: mobilityId },
        select: {
          id: true,
          name: true,
          steps: {
            select: {
              carbon: true,
              distance: true,
              metadata: true,
            },
          },
        },
      });
    }

    const [field, direction] = order.split("_");
    const directionFactor = direction === "asc" ? 1 : -1;

    if (field === "alpha") {
      trips.sort((a, b) => {
        const cmp = (a.name ?? "").localeCompare(b.name ?? "", "fr", {
          sensitivity: "base",
        });
        return cmp * directionFactor;
      });
    } else if (field === "emissions") {
      trips.sort((a, b) => {
        const aVal = a.steps.reduce((sum, s) => sum + (s.carbon ?? 0), 0);
        const bVal = b.steps.reduce((sum, s) => sum + (s.carbon ?? 0), 0);
        return (aVal - bVal) * directionFactor;
      });
    } else if (field === "duration") {
      trips.sort((a, b) => {
        const aVal = a.steps.reduce((sum, s) => sum + getStepDuration(s), 0);
        const bVal = b.steps.reduce((sum, s) => sum + getStepDuration(s), 0);
        return (aVal - bVal) * directionFactor;
      });
    } else if (field === "distance") {
      trips.sort((a, b) => {
        const aVal = a.steps.reduce((sum, s) => sum + (s.distance ?? 0), 0);
        const bVal = b.steps.reduce((sum, s) => sum + (s.distance ?? 0), 0);
        return (aVal - bVal) * directionFactor;
      });
    } else if (field === "steps") {
      trips.sort((a, b) => (a.steps.length - b.steps.length) * directionFactor);
    }

    res.json(trips.map((m) => ({ id: m.id })));
  } catch (error) {
    console.error("Error fetching trips:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * GET /api/v1/trips/{id}
 * Get trip properties only
 */
async function getTrip(req, res) {
  try {
    const { tripId } = req.params;
    const userId = req.user.id;

    if (!tripId) {
      return res.status(400).json({ error: "Trip ID is required" });
    }

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        mobility: {
          select: { userId: true },
        },
      },
    });

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    if (trip.mobility.userId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json({
      id: trip.id,
      name: trip.name,
      isSelected: trip.isSelected,
      mobilityId: trip.mobilityId,
    });
  } catch (error) {
    console.error("Error fetching trip:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * GET /api/v1/trips/{id}/stats
 * Get aggregated statistics for a trip
 */
async function getTripStatsHandler(req, res) {
  try {
    const { tripId } = req.params;
    const userId = req.user.id;

    if (!tripId) {
      return res.status(400).json({ error: "Trip ID is required" });
    }

    let trip;
    try {
      trip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: {
          mobility: {
            select: { userId: true },
          },
          steps: {
            select: {
              carbon: true,
              distance: true,
              time: true,
              metadata: true,
            },
          },
        },
      });
    } catch (error) {
      if (!isMissingStepTimeColumnError(error)) {
        throw error;
      }

      trip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: {
          mobility: {
            select: { userId: true },
          },
          steps: {
            select: {
              carbon: true,
              distance: true,
              metadata: true,
            },
          },
        },
      });
    }

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    if (trip.mobility.userId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const stats = calculateStepsStats(trip.steps);

    res.json(stats);
  } catch (error) {
    console.error("Error fetching trip stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * POST /api/v1/mobilities/{mobilityId}/trips
 * Create a new trip
 */
async function createTrip(req, res) {
  try {
    const mobilityId = req.params.mobilityId ?? req.params.id;
    const { name } = req.body;
    const userId = req.user.id;

    if (!mobilityId || !name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const mobility = await prisma.mobility.findUnique({
      where: { id: mobilityId },
      select: { userId: true },
    });

    if (!mobility) {
      return res.status(404).json({ error: "Mobility not found" });
    }

    if (mobility.userId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const newTrip = await prisma.trip.create({
      data: {
        mobilityId,
        name,
        isSelected: true,
      },
    });

    res.status(201).json({ id: newTrip.id });
  } catch (error) {
    console.error("Error creating trip:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
/**
 * PATCH /api/v1/trips/{id}
 * Update a trip
 */
async function updateTrip(req, res) {
  try {
    const { tripId } = req.params;
    const userId = req.user.id;
    const { name, isSelected } = req.body;

    if (!tripId) {
      return res.status(400).json({ error: "Trip ID is required" });
    }

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        mobility: {
          select: { userId: true },
        },
      },
    });

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    if (trip.mobility.userId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updatedTrip = await prisma.trip.update({
      where: { id: tripId },
      data: {
        ...(name !== undefined && { name }),
        ...(isSelected !== undefined && { isSelected }),
      },
    });

    res.json(updatedTrip);
  } catch (error) {
    console.error("Error updating trip:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * DELETE /api/v1/trips/{id}
 * Delete a trip
 */
async function deleteTrip(req, res) {
  try {
    const { tripId } = req.params;
    const userId = req.user.id;

    if (!tripId) {
      return res.status(400).json({ error: "Trip ID is required" });
    }

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        mobility: {
          select: { userId: true },
        },
      },
    });

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    if (trip.mobility.userId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await prisma.trip.delete({
      where: { id: tripId },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting trip:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  getTrips,
  getTrip,
  getTripStatsHandler,
  createTrip,
  updateTrip,
  deleteTrip,
};
