const { PrismaClient } = require("@prisma/client");
const { getMobilityStats: calculateMobilityStats } = require("../utils/stats");

const prisma = new PrismaClient();

function isMissingStepTimeColumnError(error) {
  if (!error || error.code !== "P2022") return false;
  const target = error?.meta?.column || error?.meta?.target || "";
  return String(target).toLowerCase().includes("time");
}

function parseMobilityYear(value) {
  if (value === undefined || value === null || value === "") return null;

  const strValue = String(value).trim();
  const yearMatch = strValue.match(/^(\d{4})$/);
  if (yearMatch) {
    const yearNum = Number(yearMatch[1]);
    if (yearNum < 1900 || yearNum > 2100) return null;
    return new Date(`${yearMatch[1]}-01-01T00:00:00.000Z`);
  }

  const date = new Date(strValue);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

/**
 * GET /api/v1/mobilities
 * Get list of user mobilities
 */
async function getMobilities(req, res) {
  try {
    const userId = req.user.id;
    const mobilities = await prisma.mobility.findMany({
      where: { userId },
      orderBy: { lastEdit: "desc" },
      select: { id: true },
    });
    res.json(mobilities.map((m) => ({ id: m.id })));
  } catch (error) {
    console.error("Error fetching mobilities:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * GET /api/v1/mobilities/{id}
 * Get mobility properties only
 */
async function getMobility(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const mobility = await prisma.mobility.findUnique({
      where: { id },
    });

    if (!mobility) {
      return res.status(404).json({ error: "Mobility not found" });
    }

    if (mobility.userId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json({
      id: mobility.id,
      name: mobility.name,
      year: mobility.year,
      isPublic: mobility.isPublic,
      isOriginal: mobility.isOriginal,
      lastEdit: mobility.lastEdit,
      startLocation: mobility.startLocation,
      endLocation: mobility.endLocation,
    });
  } catch (error) {
    console.error("Error fetching mobility:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * GET /api/v1/mobilities/{id}/stats
 * Get aggregated statistics for a mobility and its trips
 */
async function getMobilityStats(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const mobility = await prisma.mobility.findUnique({
      where: { id },
      select: { userId: true },
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
        where: {
          mobilityId: id,
          isSelected: true,
        },
        include: {
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
        where: {
          mobilityId: id,
          isSelected: true,
        },
        include: {
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

    const stats = calculateMobilityStats(trips);

    res.json(stats);
  } catch (error) {
    console.error("Error fetching mobility stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * DELETE /api/v1/mobilities/{id}
 * Delete a mobility (only if user owns it)
 */
async function deleteMobility(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const mobility = await prisma.mobility.findUnique({
      where: { id },
    });

    if (!mobility) {
      return res.status(404).json({ error: "Mobility not found" });
    }

    if (mobility.userId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await prisma.mobility.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting mobility:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * POST /api/v1/mobilities
 * Create a new mobility
 */
async function createMobility(req, res) {
  try {
    const userId = req.user.id;
    const { name, year, isPublic, isOriginal, startLocation, endLocation } =
      req.body;

    if (!name || !year || !startLocation || !endLocation) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const parsedYear = parseMobilityYear(year);
    if (!parsedYear) {
      return res.status(400).json({ error: "Invalid year format" });
    }

    const newMobility = await prisma.mobility.create({
      data: {
        name,
        year: parsedYear,
        isPublic,
        isOriginal,
        startLocation,
        endLocation,
        userId: req.user.id,
      },
    });
    res.status(201).json({ id: newMobility.id });
  } catch (error) {
    console.error("Error creating mobility:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * PATCH /api/v1/mobilities/{id}
 * Update a mobility
 */
async function updateMobility(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    const mobility = await prisma.mobility.findUnique({
      where: { id },
    });

    if (!mobility) {
      return res.status(404).json({ error: "Mobility not found" });
    }

    if (mobility.userId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const allowedFields = [
      "name",
      "year",
      "isPublic",
      "startLocation",
      "endLocation",
    ];

    const filteredUpdates = {};
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        if (key === "year") {
          const parsedYear = parseMobilityYear(updates[key]);
          if (!parsedYear) {
            return res.status(400).json({ error: "Invalid year format" });
          }
          filteredUpdates[key] = parsedYear;
        } else {
          filteredUpdates[key] = updates[key];
        }
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    await prisma.mobility.update({
      where: { id },
      data: filteredUpdates,
    });

    res.json(filteredUpdates);
  } catch (error) {
    console.error("Error updating mobility:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * POST /api/v1/mobilities/{id}/duplicate
 * Duplicate a mobility along with its trips and steps
 */
async function duplicateMobility(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const mobilityToDuplicate = await prisma.mobility.findUnique({
      where: { id },
      include: {
        trips: {
          include: {
            steps: true,
          },
        },
      },
    });

    if (!mobilityToDuplicate) {
      return res.status(404).json({ error: "Mobility not found" });
    }

    if (!mobilityToDuplicate.isPublic) {
      return res
        .status(403)
        .json({ error: "Forbidden: Mobility is not public" });
    }

    const newMobility = await prisma.mobility.create({
      data: {
        userId,
        name: `Copie de ${mobilityToDuplicate.name}`,
        year: mobilityToDuplicate.year,
        isPublic: mobilityToDuplicate.isPublic,
        isOriginal: false,
        startLocation: mobilityToDuplicate.startLocation,
        endLocation: mobilityToDuplicate.endLocation,
        trips: {
          create: mobilityToDuplicate.trips.map((trip) => ({
            name: trip.name,
            isSelected: trip.isSelected,
            steps: {
              create: trip.steps.map((step) => ({
                transportMode: step.transportMode,
                sequenceOrder: step.sequenceOrder,
                labelStart: step.labelStart,
                labelEnd: step.labelEnd,
                pointStart: step.pointStart,
                pointEnd: step.pointEnd,
                distance: step.distance,
                time: step.time,
                carbon: step.carbon,
                metadata: step.metadata,
              })),
            },
          })),
        },
      },
    });

    res.status(201).json({ id: newMobility.id });
  } catch (error) {
    console.error("Error duplicating mobility:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  getMobilities,
  getMobility,
  getMobilityStats,
  createMobility,
  deleteMobility,
  updateMobility,
  duplicateMobility,
};
