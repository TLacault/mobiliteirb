const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function toSafeNumber(value, defaultValue = 0) {
  if (value === undefined || value === null) return defaultValue;

  // Prisma can return bigint/Decimal-like values depending on DB schema.
  if (typeof value === "bigint") {
    const converted = Number(value);
    return Number.isFinite(converted) ? converted : defaultValue;
  }

  const converted = Number(value);
  return Number.isFinite(converted) ? converted : defaultValue;
}

function getStepTime(step) {
  if (step?.time !== undefined && step?.time !== null) {
    return toSafeNumber(step.time, 0);
  }

  return toSafeNumber(step?.metadata?.duration, 0);
}

/**
 * Calculate statistics for a single step
 * @param {Object} step - Step object with carbon, distance, time fields
 * @returns {Object} Step statistics
 */
function calculateStepStats(step) {
  return {
    carbon: toSafeNumber(step?.carbon, 0),
    distance: toSafeNumber(step?.distance, 0),
    time: getStepTime(step),
  };
}

/**
 * Calculate aggregated statistics for a list of steps
 * @param {Array} steps - Array of step objects
 * @returns {Object} Aggregated statistics
 */
function calculateStepsStats(steps) {
  if (!Array.isArray(steps) || steps.length === 0) {
    return {
      totalCarbon: 0,
      totalDistance: 0,
      totalTime: 0,
      stepCount: 0,
    };
  }

  const totalCarbon = steps.reduce(
    (sum, s) => sum + toSafeNumber(s?.carbon),
    0,
  );
  const totalDistance = steps.reduce(
    (sum, s) => sum + toSafeNumber(s?.distance),
    0,
  );
  const totalTime = steps.reduce((sum, s) => sum + getStepTime(s), 0);

  return {
    totalCarbon: Math.round(totalCarbon * 100) / 100,
    totalDistance: Math.round(totalDistance * 100) / 100,
    totalTime: totalTime,
    stepCount: steps.length,
  };
}

/**
 * Get statistics for a single trip
 * @param {string} tripId - Trip ID
 * @returns {Promise<Object>} Trip statistics
 */
async function getTripStats(tripId) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      steps: {
        select: {
          carbon: true,
          distance: true,
          time: true,
        },
      },
    },
  });

  if (!trip) {
    return null;
  }

  return calculateStepsStats(trip.steps);
}

/**
 * Get statistics for all trips in a mobility
 * @param {Array} trips - Array of trip objects with steps included
 * @returns {Object} Aggregated statistics across all trips
 */
function getMobilityStats(trips) {
  if (!Array.isArray(trips) || trips.length === 0) {
    return {
      totalCarbon: 0,
      totalDistance: 0,
      totalTime: 0,
      stepCount: 0,
      tripCount: 0,
    };
  }

  let totalCarbon = 0;
  let totalDistance = 0;
  let totalTime = 0;
  let totalSteps = 0;

  trips.forEach((trip) => {
    if (trip.steps && Array.isArray(trip.steps)) {
      trip.steps.forEach((step) => {
        totalCarbon += toSafeNumber(step?.carbon);
        totalDistance += toSafeNumber(step?.distance);
        totalTime += getStepTime(step);
      });
      totalSteps += trip.steps.length;
    }
  });

  return {
    totalCarbon: Math.round(totalCarbon * 100) / 100,
    totalDistance: Math.round(totalDistance * 100) / 100,
    totalTime: totalTime,
    stepCount: totalSteps,
    tripCount: trips.length,
  };
}

module.exports = {
  calculateStepStats,
  calculateStepsStats,
  getTripStats,
  getMobilityStats,
};
