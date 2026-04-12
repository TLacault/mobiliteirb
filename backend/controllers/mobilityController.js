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
            email: true,
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
      isAnonymous: mobility.isAnonymous,
      author: {
        casLogin: !mobility.isAnonymous
          ? mobility.user?.casLogin ?? "Anonyme"
          : "Anonyme",
        email: !mobility.isAnonymous ? mobility.user?.email ?? null : null,
      },
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
    const { preview } = req.query;

    const mobility = await prisma.mobility.findUnique({
      where: { id },
    });

    if (!mobility) {
      return res.status(404).json({ error: "Mobility not found" });
    }

    if (preview === "true") {
      return res.json({
        id: mobility.id,
        name: mobility.name,
        year: mobility.year,
        isAnonymous: mobility.isAnonymous,
        lastEdit: mobility.lastEdit,
        startLocation: mobility.startLocation,
        endLocation: mobility.endLocation,
        notes: null,
      });
    }

    if (mobility.userId !== userId && !preview) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json({
      id: mobility.id,
      name: mobility.name,
      year: mobility.year,
      isAnonymous: mobility.isAnonymous,
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
    const { preview } = req.query;

    const mobility = await prisma.mobility.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!mobility) {
      return res.status(404).json({ error: "Mobility not found" });
    }

    if (mobility.userId !== userId && !preview) {
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
    const { name, year, isAnonymous, startLocation, endLocation } = req.body;

    if (!name || !year || !startLocation || !endLocation) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const mobilityCount = await prisma.mobility.count({ where: { userId } });
    if (mobilityCount >= 20) {
      return res
        .status(429)
        .json({
          error: "Limite atteinte : 20 mobilités maximum par utilisateur.",
        });
    }

    const parsedYear = parseMobilityYear(year);
    if (!parsedYear) {
      return res.status(400).json({ error: "Invalid year format" });
    }

    const newMobility = await prisma.mobility.create({
      data: {
        name,
        year: parsedYear,
        isAnonymous,
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
      "isAnonymous",
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

    const mobilityCount = await prisma.mobility.count({ where: { userId } });
    if (mobilityCount >= 20) {
      return res
        .status(429)
        .json({
          error: "Limite atteinte : 20 mobilités maximum par utilisateur.",
        });
    }

    const newMobility = await prisma.mobility.create({
      data: {
        user: { connect: { id: userId } },
        name: !mobilityToDuplicate.isAnonymous
          ? `Copie de ${mobilityToDuplicate.name}`
          : "Copie anonyme",
        year: mobilityToDuplicate.year,
        isAnonymous: false,
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
                metadata: null,
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

async function exportMobility(req, res) {
  try {
    const { id } = req.params;
    const mode = String(req.query.mode || "json").toLowerCase();
    const userId = req.user.id;

    let mobility;
    try {
      mobility = await prisma.mobility.findUnique({
        where: { id },
        include: {
          trips: {
            where: { isSelected: true },
            include: {
              steps: {
                select: {
                  sequenceOrder: true,
                  transportMode: true,
                  labelStart: true,
                  labelEnd: true,
                  distance: true,
                  time: true,
                  carbon: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      if (!isMissingStepTimeColumnError(error)) {
        throw error;
      }

      mobility = await prisma.mobility.findUnique({
        where: { id },
        include: {
          trips: {
            where: { isSelected: true },
            include: {
              steps: {
                select: {
                  sequenceOrder: true,
                  transportMode: true,
                  labelStart: true,
                  labelEnd: true,
                  distance: true,
                  carbon: true,
                },
              },
            },
          },
        },
      });

      if (mobility?.trips?.length) {
        mobility.trips = mobility.trips.map((trip) => ({
          ...trip,
          steps: (trip.steps || []).map((step) => ({
            ...step,
            time: null,
          })),
        }));
      }
    }

    if (!mobility) return res.status(404).json({ error: "Mobility not found" });
    if (mobility.userId !== userId)
      return res.status(403).json({ error: "Forbidden" });

    if (mode === "pdf") {
      try {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="mobility-${id}.pdf"`,
        );

        const pdfBuffer = await generateMobilityPdf(mobility);
        return res.status(200).send(pdfBuffer);
      } catch (pdfError) {
        console.error("Error generating PDF:", pdfError);
        return res.status(500).json({ error: "Failed to generate PDF" });
      }
    }

    if (mode === "csv") {
      const escapeCsv = (value) => {
        const str = String(value ?? "");
        return `"${str.replace(/"/g, '""')}"`;
      };

      const rows = [
        [
          "mobilityId",
          "mobilityName",
          "year",
          "startLocation",
          "endLocation",
          "tripId",
          "tripName",
          "tripIsSelected",
          "stepOrder",
          "transportMode",
          "labelStart",
          "labelEnd",
          "distance",
          "time",
          "carbon",
        ],
      ];

      (mobility.trips || []).forEach((trip) => {
        (trip.steps || []).forEach((step) => {
          rows.push([
            mobility.id,
            mobility.name,
            mobility.year
              ? new Date(mobility.year).toISOString().slice(0, 10)
              : "",
            mobility.startLocation,
            mobility.endLocation,
            trip.id,
            trip.name,
            trip.isSelected,
            step.sequenceOrder,
            step.transportMode,
            step.labelStart,
            step.labelEnd,
            step.distance,
            step.time,
            step.carbon,
          ]);
        });
      });

      const csvContent = rows
        .map((row) => row.map((cell) => escapeCsv(cell)).join(","))
        .join("\n");

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="mobility-${id}.csv"`,
      );

      return res.status(200).send(csvContent);
    }

    res.json(mobility);
  } catch (error) {
    console.error("Error exporting mobility:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Generates a PDF buffer from mobility data
 * @async
 * @function generateMobilityPdf
 * @param {Object} mobility - The mobility object containing data to be converted to PDF
 * @returns {Promise<Buffer>} A Promise that resolves to a PDF buffer
 * @throws {Error} May throw an error if PDF generation fails
 * @example
 * const pdfBuffer = await generateMobilityPdf(mobility);
 */
async function generateMobilityPdf(mobility) {
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 42;
  const fontSize = 11;
  const lineHeight = 12;
  const maxCharsPerLine = 96;
  const linesPerPage = Math.floor((pageHeight - margin * 2) / lineHeight);

  function normalizePdfText(value) {
    const text = String(value ?? "");
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)")
      .replace(/\r?\n/g, " ")
      .replace(/[^\x20-\x7E]/g, "?");
  }

  function wrapPdfText(value, maxLength) {
    const words = normalizePdfText(value)
      .replace(/\t/g, "    ")
      .split(/\s+/)
      .filter(Boolean);
    if (words.length === 0) return [""];

    const lines = [];
    let currentLine = "";

    words.forEach((word) => {
      if (word.length > maxLength) {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = "";
        }

        for (let index = 0; index < word.length; index += maxLength) {
          lines.push(word.slice(index, index + maxLength));
        }
        return;
      }

      const candidate = currentLine ? `${currentLine} ${word}` : word;
      if (candidate.length > maxLength) {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = candidate;
      }
    });

    if (currentLine) lines.push(currentLine);
    return lines.length > 0 ? lines : [""];
  }

  function addTitle(lines, text) {
    lines.push({
      text: text.toUpperCase(),
      size: 18,
      isBold: true,
      indent: 0,
      spacing: 20,
    });
  }

  function addSubtitle(lines, text) {
    lines.push({ text, size: 13, isBold: true, indent: 0, spacing: 15 });
  }

  function addBody(lines, text, indent = 0) {
    const rawParts = String(text ?? "").split(/\r?\n/);
    rawParts.forEach((part) => {
      const wrapped = wrapPdfText(part, maxCharsPerLine - indent / 5);
      wrapped.forEach((l) =>
        lines.push({ text: l, size: 10, isBold: false, indent, spacing: 12 }),
      );
    });
  }

  function addSpacer(lines, count = 1) {
    for (let index = 0; index < count; index += 1) {
      lines.push({ text: "", size: 10, isBold: false, indent: 0, spacing: 10 });
    }
  }

  function formatWholeNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? String(Math.round(parsed)) : "-";
  }

  function formatTime(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return "-";
    const hours = Math.floor(parsed / 60);
    const minutes = Math.round(parsed % 60);
    return `${hours > 0 ? `${hours}h ` : ""}${minutes}min`;
  }

  function buildPdfLines() {
    const lines = [];

    addTitle(lines, mobility.name || "RAPPORT DE MOBILITÉ");
    lines.push({
      text: "________________________________________________",
      size: 10,
      indent: 0,
      spacing: 5,
    });

    addSpacer(lines, 2);

    // INFOS GÉNÉRALES
    addSubtitle(lines, "Détails de la mission");
    if (mobility.startLocation)
      addBody(lines, `Départ : ${mobility.startLocation}`, 10);
    if (mobility.endLocation)
      addBody(lines, `Arrivée : ${mobility.endLocation}`, 10);

    addSpacer(lines, 2);

    // TRAJETS
    (mobility.trips || []).forEach((trip, i) => {
      addSubtitle(lines, `Trajet ${i + 1} : ${trip.name || "Sans nom"}`);
      addSpacer(lines, 1);

      (trip.steps || []).forEach((step) => {
        const info = `${step.transportMode} | ${formatWholeNumber(
          step.distance,
        )}km | ${formatWholeNumber(step.carbon)}kg CO2 | ${formatTime(
          step.time,
        )}`;
        addBody(lines, `- ${step.labelStart} => ${step.labelEnd}`, 20);
        addBody(lines, `  [ ${info} ]`, 30);
        addSpacer(lines, 1);
      });
      addSpacer(lines, 1);
    });

    return lines;
  }

  function buildPdfPageContent(pageLines) {
    const commands = ["BT"];
    let currentY = pageHeight - margin;

    pageLines.forEach((lineObj) => {
      const safeLine =
        typeof lineObj === "string"
          ? { text: lineObj, size: 10, isBold: false, indent: 0, spacing: 10 }
          : lineObj;
      const { text, size, isBold, indent, spacing } = safeLine;

      currentY -= spacing;

      const font = isBold ? `/F1 ${size} Tf` : `/F1 ${size} Tf`;

      commands.push(`${font}`);
      commands.push(`1 0 0 1 ${margin + indent} ${currentY} Tm`);
      commands.push(`(${normalizePdfText(text)}) Tj`);
    });

    commands.push("ET");
    return commands.join("\n");
  }

  function buildPdfBuffer(lines) {
    const pages = [];
    for (let index = 0; index < lines.length; index += linesPerPage) {
      pages.push(lines.slice(index, index + linesPerPage));
    }

    const objects = [];
    objects.push("<< /Type /Catalog /Pages 2 0 R >>");
    const pageObjectIds = Array.from(
      { length: pages.length },
      (_, index) => 4 + index * 2,
    );
    objects.push(
      `<< /Type /Pages /Kids [${pageObjectIds
        .map((id) => `${id} 0 R`)
        .join(" ")}] /Count ${pages.length} >>`,
    );
    objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

    pages.forEach((pageLines, index) => {
      const pageObjectId = 4 + index * 2;
      const contentObjectId = pageObjectId + 1;
      const contentStream = buildPdfPageContent(pageLines);
      const contentLength = Buffer.byteLength(contentStream, "ascii");

      objects.push(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth.toFixed(
          2,
        )} ${pageHeight.toFixed(
          2,
        )}] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObjectId} 0 R >>`,
      );
      objects.push(
        `<< /Length ${contentLength} >>\nstream\n${contentStream}\nendstream`,
      );
    });

    let pdf = "%PDF-1.4\n";
    const offsets = [0];

    objects.forEach((body, index) => {
      const objectId = index + 1;
      offsets.push(Buffer.byteLength(pdf, "ascii"));
      pdf += `${objectId} 0 obj\n${body}\nendobj\n`;
    });

    const xrefOffset = Buffer.byteLength(pdf, "ascii");
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += "0000000000 65535 f \n";
    for (let index = 1; index < offsets.length; index += 1) {
      pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
    }
    pdf += `trailer\n<< /Size ${
      objects.length + 1
    } /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

    return Buffer.from(pdf, "ascii");
  }

  return buildPdfBuffer(buildPdfLines());
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
  exportMobility,
};
