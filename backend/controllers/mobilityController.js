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

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

function parsePage(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed >= 1 ? parsed : fallback;
}

function parseFloatOrNull(value) {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return null;
  return parsed >= 0 ? parsed : null;
}

function getStepTime(step) {
  if (step?.time !== undefined && step?.time !== null) {
    const parsed = Number(step.time);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return null;
}

function parseTransportModes(input) {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.map((mode) => String(mode).trim()).filter(Boolean);
  }

  if (typeof input !== "string") return [];
  return input
    .split(",")
    .map((mode) => mode.trim())
    .filter(Boolean);
}

function buildMobilityBaseFilter({ query, departure, arrival }) {
  const andFilters = [];

  // Recherche textuelle globale sur les lieux.
  const trimmedQuery = typeof query === "string" ? query.trim() : "";
  if (trimmedQuery) {
    const orFilters = [
      { startLocation: { contains: trimmedQuery, mode: "insensitive" } },
      { endLocation: { contains: trimmedQuery, mode: "insensitive" } },
    ];
    andFilters.push({ OR: orFilters });
  }

  const trimmedDeparture =
    typeof departure === "string" ? departure.trim() : "";
  if (trimmedDeparture) {
    andFilters.push({
      startLocation: { contains: trimmedDeparture, mode: "insensitive" },
    });
  }

  const trimmedArrival = typeof arrival === "string" ? arrival.trim() : "";
  if (trimmedArrival) {
    andFilters.push({
      endLocation: { contains: trimmedArrival, mode: "insensitive" },
    });
  }

  return andFilters.length > 0 ? { AND: andFilters } : {};
}

const mobilityDirectOrderMap = {
  lastEdit_desc: { lastEdit: "desc" },
  lastEdit_asc: { lastEdit: "asc" },
  name_asc: { name: "asc" },
  name_desc: { name: "desc" },
  year_desc: { year: "desc" },
  year_asc: { year: "asc" },
};

/**
 * GET /api/v1/mobilities/searchMobilty
 * Search public mobilities with sorting and pagination
 */
async function searchMobilty(req, res) {
  try {
    const query =
      typeof req.query.criteria === "string"
        ? req.query.criteria
        : req.query.query;

    const filters = {
      query,
      departure: req.query.departure,
      arrival: req.query.arrival,
      minCarbon: parseFloatOrNull(req.query.minCarbon),
      maxCarbon: parseFloatOrNull(req.query.maxCarbon),
      minTime: parseFloatOrNull(req.query.minTime),
      maxTime: parseFloatOrNull(req.query.maxTime),
      minDistance: parseFloatOrNull(req.query.minDistance),
      maxDistance: parseFloatOrNull(req.query.maxDistance),
      minSteps: parsePositiveInt(req.query.minSteps, null),
      maxSteps: parsePositiveInt(req.query.maxSteps, null),
      transportModes: parseTransportModes(req.query.transportModes),
    };

    const requestedOrder =
      typeof req.query.order === "string" ? req.query.order : "lastEdit_desc";

    const page = parsePage(req.query.page, 1);
    const pageSize = 10;
    const baseFilter = buildMobilityBaseFilter(filters);
    const where = {
      ...baseFilter,
      AND: [...(baseFilter.AND ?? []), { userId: { not: req.user.id } }],
    };

    const directOrderBy =
      mobilityDirectOrderMap[requestedOrder] ??
      mobilityDirectOrderMap.lastEdit_desc;

    const mobilitiesRaw = await prisma.mobility.findMany({
      where,
      orderBy: directOrderBy,
      include: {
        user: {
          select: {
            casLogin: true,
          },
        },
        trips: {
          select: {
            id: true,
            steps: {
              select: {
                transportMode: true,
                carbon: true,
                distance: true,
                time: true,
                metadata: true,
              },
            },
          },
        },
      },
    });

    // DEBUG: à retirer après investigation
    console.log("[searchMobilty] where:", JSON.stringify(where, null, 2));
    console.log("[searchMobilty] mobilitiesRaw count:", mobilitiesRaw.length);

    const withStats = mobilitiesRaw.map((mobility) => {
      const allSteps = mobility.trips.flatMap((trip) => trip.steps ?? []);

      const totalCarbon = allSteps.reduce(
        (sum, step) => sum + (Number(step?.carbon) || 0),
        0,
      );
      const totalDistance = allSteps.reduce(
        (sum, step) => sum + (Number(step?.distance) || 0),
        0,
      );
      const totalTime = allSteps.reduce(
        (sum, step) => sum + (getStepTime(step) ?? 0),
        0,
      );
      const stepCount = allSteps.length;

      const transportCounts = allSteps.reduce((acc, step) => {
        const mode =
          typeof step?.transportMode === "string"
            ? step.transportMode
            : "unknown";
        acc[mode] = (acc[mode] || 0) + 1;
        return acc;
      }, {});

      const selectedTransportScore = filters.transportModes.length
        ? filters.transportModes.reduce(
            (sum, mode) => sum + (transportCounts[mode] || 0),
            0,
          )
        : Object.values(transportCounts).reduce((sum, val) => sum + val, 0);

      return {
        ...mobility,
        stats: {
          totalCarbon: Math.round(totalCarbon * 100) / 100,
          totalDistance: Math.round(totalDistance * 100) / 100,
          totalTime,
          stepCount,
          tripCount: mobility.trips.length,
          transportCounts,
          selectedTransportScore,
        },
      };
    });

    const filtered = withStats.filter((mobility) => {
      const stats = mobility.stats;
      if (filters.minCarbon !== null && stats.totalCarbon < filters.minCarbon) {
        return false;
      }
      if (filters.maxCarbon !== null && stats.totalCarbon > filters.maxCarbon) {
        return false;
      }

      if (filters.minTime !== null && stats.totalTime < filters.minTime) {
        return false;
      }
      if (filters.maxTime !== null && stats.totalTime > filters.maxTime) {
        return false;
      }

      if (
        filters.minDistance !== null &&
        stats.totalDistance < filters.minDistance
      ) {
        return false;
      }
      if (
        filters.maxDistance !== null &&
        stats.totalDistance > filters.maxDistance
      ) {
        return false;
      }

      if (filters.minSteps !== null && stats.stepCount < filters.minSteps) {
        return false;
      }
      if (filters.maxSteps !== null && stats.stepCount > filters.maxSteps) {
        return false;
      }

      if (
        filters.transportModes.length > 0 &&
        stats.stepCount > 0 &&
        stats.selectedTransportScore <= 0
      ) {
        return false;
      }

      return true;
    });

    const [orderField, orderDirection] = requestedOrder.split("_");
    const directionFactor = orderDirection === "asc" ? 1 : -1;

    const sortWithDirection = (a, b, selector) => {
      const aVal = selector(a);
      const bVal = selector(b);

      if (typeof aVal === "string" || typeof bVal === "string") {
        return (
          String(aVal || "").localeCompare(String(bVal || ""), "fr", {
            sensitivity: "base",
          }) * directionFactor
        );
      }

      return ((Number(aVal) || 0) - (Number(bVal) || 0)) * directionFactor;
    };

    if (orderField === "emissions" || orderField === "carbon") {
      filtered.sort((a, b) =>
        sortWithDirection(a, b, (m) => m.stats.totalCarbon),
      );
    } else if (orderField === "duration" || orderField === "time") {
      filtered.sort((a, b) =>
        sortWithDirection(a, b, (m) => m.stats.totalTime),
      );
    } else if (orderField === "distance") {
      filtered.sort((a, b) =>
        sortWithDirection(a, b, (m) => m.stats.totalDistance),
      );
    } else if (orderField === "steps") {
      filtered.sort((a, b) =>
        sortWithDirection(a, b, (m) => m.stats.stepCount),
      );
    } else if (orderField === "transport") {
      filtered.sort((a, b) =>
        sortWithDirection(a, b, (m) => m.stats.selectedTransportScore),
      );
    }

    const total = filtered.length;
    const skip = (page - 1) * pageSize;
    const paginated = filtered.slice(skip, skip + pageSize).map((mobility) => ({
      id: mobility.id,
      name: mobility.name,
      year: mobility.year,
      startLocation: mobility.startLocation,
      endLocation: mobility.endLocation,
      lastEdit: mobility.lastEdit,
      isPublic: mobility.isPublic,
      isOriginal: mobility.isOriginal,
      author: mobility.isPublic
        ? { casLogin: mobility.user?.casLogin ?? null }
        : null,
      stats: {
        totalCarbon: mobility.stats.totalCarbon,
        totalDistance: mobility.stats.totalDistance,
        totalTime: mobility.stats.totalTime,
        stepCount: mobility.stats.stepCount,
        tripCount: mobility.stats.tripCount,
        transportCounts: mobility.stats.transportCounts,
      },
    }));

    res.json({
      data: paginated,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
  } catch (error) {
    console.error("Error searching mobilities:", error);
    res.status(500).json({ error: "Internal server error" });
  }
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

    const newMobility = await prisma.mobility.create({
      data: {
        userId,
        name: `Copie de ${mobilityToDuplicate.name}`, //   TODO: "Anonyme" is !isPublic
        year: mobilityToDuplicate.year,
        isPublic: mobilityToDuplicate.isPublic, // TODO: true
        isOriginal: false, // TODO: true
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
                metadata: step.metadata, // TODO: NULL
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
  searchMobilty,
  getMobility,
  getMobilityStats,
  createMobility,
  deleteMobility,
  updateMobility,
  duplicateMobility,
};
