// Example queries to use with seeded data
// Import this in your backend code or use in Prisma Studio console

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// ============================================
// BASIC QUERIES
// ============================================

// Get all users with their mobility count
async function getUsersWithMobilityCount() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      casLogin: true,
      email: true,
      role: true,
      _count: {
        select: { mobilities: true },
      },
    },
  });

  console.log("Users with mobility counts:", users);
  return users;
}

// Get all public mobilities
async function getPublicMobilities() {
  const mobilities = await prisma.mobility.findMany({
    where: { isPublic: true },
    include: {
      user: {
        select: { casLogin: true, email: true },
      },
      _count: {
        select: { trips: true },
      },
    },
  });

  console.log("Public mobilities:", mobilities);
  return mobilities;
}

// Get a complete trip with all steps and transport modes
async function getCompleteTripDetails(tripId) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      mobility: {
        include: {
          user: {
            select: { casLogin: true },
          },
        },
      },
      steps: {
        orderBy: {
          sequenceOrder: "asc",
        },
      },
    },
  });

  console.log("Complete trip:", JSON.stringify(trip, null, 2));
  return trip;
}

// ============================================
// ADVANCED QUERIES
// ============================================

// Get selected trips for each mobility
async function getSelectedTrips() {
  const selectedTrips = await prisma.trip.findMany({
    where: { isSelected: true },
    include: {
      mobility: {
        select: {
          name: true,
          startLocation: true,
          endLocation: true,
        },
      },
      steps: {
        orderBy: { sequenceOrder: "asc" },
      },
    },
  });

  console.log("Selected trips:", selectedTrips.length);
  return selectedTrips;
}

// Calculate total carbon emissions for a mobility
async function getMobilityCarbon(mobilityId) {
  const mobility = await prisma.mobility.findUnique({
    where: { id: mobilityId },
    include: {
      trips: {
        where: { isSelected: true },
        include: {
          steps: {
            select: {
              carbon: true,
              distance: true,
            },
          },
        },
      },
    },
  });

  if (!mobility || !mobility.trips[0]) {
    return null;
  }

  const selectedTrip = mobility.trips[0];
  const totalCarbon = selectedTrip.steps.reduce(
    (sum, step) => sum + (step.carbon || 0),
    0,
  );
  const totalDistance = selectedTrip.steps.reduce(
    (sum, step) => sum + (step.distance || 0),
    0,
  );

  console.log(`Mobility: ${mobility.name}`);
  console.log(`Total Carbon: ${totalCarbon.toFixed(3)} kg CO₂`);
  console.log(`Total Distance: ${totalDistance.toFixed(2)} km`);

  return { mobility, totalCarbon, totalDistance };
}

// Get most popular transport modes
async function getTransportModeStatistics() {
  const modes = await prisma.step.groupBy({
    by: ["transportMode"],
    _count: {
      transportMode: true,
    },
    _avg: {
      transportCarbonFactor: true,
    },
    orderBy: {
      _count: {
        transportMode: "desc",
      },
    },
    where: {
      transportMode: { not: null },
    },
  });

  console.log("Transport mode statistics:");
  modes.forEach((mode) => {
    console.log(
      `  ${mode.transportMode}: ${
        mode._count.transportMode
      } uses, avg carbon: ${mode._avg.transportCarbonFactor?.toFixed(3)} kg/km`,
    );
  });

  return modes;
}

// Find mobilities by city
async function findMobilitiesByCity(cityName) {
  const mobilities = await prisma.mobility.findMany({
    where: {
      OR: [
        { startLocation: { contains: cityName, mode: "insensitive" } },
        { endLocation: { contains: cityName, mode: "insensitive" } },
      ],
    },
    include: {
      user: {
        select: { casLogin: true },
      },
      trips: {
        where: { isSelected: true },
        include: {
          steps: true,
        },
      },
    },
  });

  console.log(`Mobilities involving ${cityName}:`, mobilities.length);
  return mobilities;
}

// Compare trips for a mobility
async function compareTripsForMobility(mobilityId) {
  const mobility = await prisma.mobility.findUnique({
    where: { id: mobilityId },
    include: {
      trips: {
        include: {
          steps: true,
        },
      },
    },
  });

  if (!mobility) return null;

  console.log(`\nComparing trips for: ${mobility.name}\n`);

  const tripStats = mobility.trips.map((trip) => {
    const totalCarbon = trip.steps.reduce(
      (sum, step) => sum + (step.carbon || 0),
      0,
    );
    const totalDistance = trip.steps.reduce(
      (sum, step) => sum + (step.distance || 0),
      0,
    );
    const uniqueModes = [
      ...new Set(trip.steps.map((s) => s.transportMode).filter(Boolean)),
    ];

    return {
      name: trip.name,
      isSelected: trip.isSelected,
      stepCount: trip.steps.length,
      totalCarbon: totalCarbon.toFixed(3),
      totalDistance: totalDistance.toFixed(2),
      modes: uniqueModes,
    };
  });

  console.table(tripStats);
  return tripStats;
}

// Get user's carbon footprint
async function getUserCarbonFootprint(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      mobilities: {
        include: {
          trips: {
            where: { isSelected: true },
            include: {
              steps: {
                select: {
                  carbon: true,
                  distance: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) return null;

  let totalCarbon = 0;
  let totalDistance = 0;
  let mobilityCount = 0;

  user.mobilities.forEach((mobility) => {
    if (mobility.trips[0]) {
      mobilityCount++;
      mobility.trips[0].steps.forEach((step) => {
        totalCarbon += step.carbon || 0;
        totalDistance += step.distance || 0;
      });
    }
  });

  const footprint = {
    user: user.casLogin,
    mobilityCount,
    totalCarbon: totalCarbon.toFixed(3),
    totalDistance: totalDistance.toFixed(2),
    avgCarbonPerMobility: (totalCarbon / mobilityCount).toFixed(3),
  };

  console.log(`\nCarbon footprint for ${user.casLogin}:`);
  console.table(footprint);

  return footprint;
}

// Get eco-friendly trips (lowest carbon)
async function getEcoFriendlyTrips(limit = 10) {
  // Get all selected trips with their carbon totals
  const trips = await prisma.trip.findMany({
    where: { isSelected: true },
    include: {
      mobility: {
        select: {
          name: true,
          user: {
            select: { casLogin: true },
          },
        },
      },
      steps: {
        select: {
          carbon: true,
          distance: true,
        },
      },
    },
  });

  // Calculate total carbon for each trip
  const tripStats = trips
    .map((trip) => ({
      tripName: trip.name,
      mobilityRoute: trip.mobility.name,
      user: trip.mobility.user.casLogin,
      totalCarbon: trip.steps.reduce(
        (sum, step) => sum + (step.carbon || 0),
        0,
      ),
      totalDistance: trip.steps.reduce(
        (sum, step) => sum + (step.distance || 0),
        0,
      ),
    }))
    .sort((a, b) => a.totalCarbon - b.totalCarbon)
    .slice(0, limit);

  console.log(`\nTop ${limit} eco-friendly trips:`);
  console.table(tripStats);

  return tripStats;
}

// ============================================
// SPATIAL QUERIES (PostGIS)
// ============================================

// Example: Get steps within a bounding box
// Note: Requires raw SQL due to PostGIS
async function getStepsInArea(minLat, maxLat, minLng, maxLng) {
  const steps = await prisma.$queryRaw`
    SELECT
      s.id,
      s.label_start,
      s.label_end,
      s.carbon,
      s.distance,
      ST_AsText(s.point_start) as point_start,
      ST_AsText(s.point_end) as point_end
    FROM steps s
    WHERE ST_Within(
      s.point_start,
      ST_MakeEnvelope(${minLng}, ${minLat}, ${maxLng}, ${maxLat}, 4326)
    )
    LIMIT 50
  `;

  console.log(
    `Steps in area (${minLat},${minLng}) to (${maxLat},${maxLng}):`,
    steps.length,
  );
  return steps;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Get a random mobility ID to test with
async function getRandomMobilityId() {
  const count = await prisma.mobility.count();
  const skip = Math.floor(Math.random() * count);
  const mobility = await prisma.mobility.findFirst({
    skip,
    select: { id: true, name: true },
  });
  console.log("Random mobility:", mobility);
  return mobility?.id;
}

// Get a random user ID to test with
async function getRandomUserId() {
  const count = await prisma.user.count();
  const skip = Math.floor(Math.random() * count);
  const user = await prisma.user.findFirst({
    skip,
    select: { id: true, casLogin: true },
  });
  console.log("Random user:", user);
  return user?.id;
}

// ============================================
// EXAMPLE USAGE
// ============================================

async function runExamples() {
  console.log("🔍 Running example queries...\n");

  // Basic examples
  await getUsersWithMobilityCount();
  await getPublicMobilities();
  await getTransportModeStatistics();

  // Advanced examples with random data
  const randomMobilityId = await getRandomMobilityId();
  if (randomMobilityId) {
    await getMobilityCarbon(randomMobilityId);
    await compareTripsForMobility(randomMobilityId);
  }

  const randomUserId = await getRandomUserId();
  if (randomUserId) {
    await getUserCarbonFootprint(randomUserId);
  }

  // Search example
  await findMobilitiesByCity("Paris");

  // Eco-friendly trips
  await getEcoFriendlyTrips(5);

  // Spatial query example (France bounding box)
  await getStepsInArea(43, 51, -5, 8);
}

// Uncomment to run:
// runExamples()
//   .then(() => console.log('\n✅ Examples completed'))
//   .catch(console.error)
//   .finally(() => prisma.$disconnect());

// Export functions for use in your API
export {
  getUsersWithMobilityCount,
  getPublicMobilities,
  getCompleteTripDetails,
  getSelectedTrips,
  getMobilityCarbon,
  getTransportModeStatistics,
  findMobilitiesByCity,
  compareTripsForMobility,
  getUserCarbonFootprint,
  getEcoFriendlyTrips,
  getStepsInArea,
  getRandomMobilityId,
  getRandomUserId,
};
