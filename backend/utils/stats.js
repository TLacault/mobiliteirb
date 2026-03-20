const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Calculate statistics for a single step
 * @param {Object} step - Step object with carbon, distance, time fields
 * @returns {Object} Step statistics
 */
function calculateStepStats(step) {
  return {
    carbon: step.carbon ?? 0,
    distance: step.distance ?? 0,
    time: step.time ?? 0,
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

  const totalCarbon = steps.reduce((sum, s) => sum + (s.carbon ?? 0), 0);
  const totalDistance = steps.reduce((sum, s) => sum + (s.distance ?? 0), 0);
  const totalTime = steps.reduce((sum, s) => sum + (s.time ?? 0), 0);

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
        totalCarbon += step.carbon ?? 0;
        totalDistance += step.distance ?? 0;
        totalTime += step.time ?? 0;
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
