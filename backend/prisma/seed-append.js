import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

// Common locations for realistic mobility data
const FRENCH_CITIES = [
  "Paris",
  "Lyon",
  "Marseille",
  "Toulouse",
  "Nice",
  "Nantes",
  "Strasbourg",
  "Montpellier",
  "Bordeaux",
  "Lille",
  "Rennes",
  "Reims",
  "Le Havre",
  "Saint-Étienne",
  "Toulon",
  "Grenoble",
  "Dijon",
  "Angers",
  "Nîmes",
  "Villeurbanne",
];

const EUROPEAN_CITIES = [
  "Barcelona",
  "Madrid",
  "Berlin",
  "Munich",
  "Amsterdam",
  "Brussels",
  "London",
  "Dublin",
  "Rome",
  "Milan",
  "Lisbon",
  "Porto",
  "Vienna",
  "Prague",
  "Copenhagen",
  "Stockholm",
  "Oslo",
  "Helsinki",
  "Zurich",
  "Geneva",
];

const TRANSPORT_MODES = [
  { label: "Walking", carbonFactor: 0 },
  { label: "Bicycle", carbonFactor: 0 },
  { label: "E-Bike", carbonFactor: 0.005 },
  { label: "Bus", carbonFactor: 0.089 },
  { label: "Metro", carbonFactor: 0.006 },
  { label: "Tram", carbonFactor: 0.008 },
  { label: "Train (Regional)", carbonFactor: 0.029 },
  { label: "Train (TGV)", carbonFactor: 0.0035 },
  { label: "Car (Solo)", carbonFactor: 0.192 },
  { label: "Car (Shared)", carbonFactor: 0.096 },
  { label: "Scooter", carbonFactor: 0.084 },
  { label: "Electric Scooter", carbonFactor: 0.025 },
  { label: "Taxi", carbonFactor: 0.192 },
  { label: "Uber/VTC", carbonFactor: 0.192 },
  { label: "Flight (Short-haul)", carbonFactor: 0.255 },
  { label: "Flight (Long-haul)", carbonFactor: 0.15 },
];

// Helper: Random coordinates around a city (simplified)
function generateCoordinates() {
  return {
    lat: faker.location.latitude({ min: 43, max: 51 }), // France-ish
    lng: faker.location.longitude({ min: -5, max: 8 }),
  };
}

// Helper: Random distance based on transport mode
function getDistanceForMode(mode) {
  const label = mode.label.toLowerCase();
  if (label.includes("walk"))
    return faker.number.float({ min: 0.1, max: 3, precision: 0.1 });
  if (label.includes("bicycle") || label.includes("scooter"))
    return faker.number.float({ min: 0.5, max: 15, precision: 0.1 });
  if (
    label.includes("bus") ||
    label.includes("metro") ||
    label.includes("tram")
  )
    return faker.number.float({ min: 1, max: 25, precision: 0.1 });
  if (label.includes("train (regional)"))
    return faker.number.float({ min: 10, max: 200, precision: 0.5 });
  if (label.includes("tgv"))
    return faker.number.float({ min: 100, max: 800, precision: 1 });
  if (label.includes("car"))
    return faker.number.float({ min: 5, max: 500, precision: 0.5 });
  if (label.includes("flight"))
    return faker.number.float({ min: 300, max: 5000, precision: 1 });
  return faker.number.float({ min: 1, max: 50, precision: 0.1 });
}

// Helper: Calculate carbon emissions
function calculateCarbon(distance, carbonFactor) {
  return parseFloat((distance * carbonFactor).toFixed(3));
}

// Helper: Generate a realistic trip name
function generateTripName() {
  const prefixes = [
    "Morning",
    "Evening",
    "Direct",
    "Scenic",
    "Quick",
    "Express",
    "Eco",
    "Standard",
  ];
  const suffixes = ["Route", "Journey", "Path", "Option", "Alternative"];
  return (
    faker.helpers.arrayElement(prefixes) +
    " " +
    faker.helpers.arrayElement(suffixes)
  );
}

// Helper: Generate location labels
function generateLocationLabel() {
  const placeTypes = [
    "Station",
    "Stop",
    "Terminal",
    "Airport",
    "Hub",
    "Center",
    "Plaza",
  ];
  const cityPart = faker.helpers.arrayElement([
    ...FRENCH_CITIES,
    ...EUROPEAN_CITIES,
  ]);
  return `${cityPart} ${faker.helpers.arrayElement(placeTypes)}`;
}

async function main() {
  console.log("📊 Current database state:");
  const currentUsers = await prisma.user.count();
  const currentMobilities = await prisma.mobility.count();
  const currentTrips = await prisma.trip.count();
  console.log(
    `  Users: ${currentUsers}, Mobilities: ${currentMobilities}, Trips: ${currentTrips}\n`,
  );

  console.log("➕ Appending new data (without clearing)...\n");

  // Random number of users (between 3 and 8 for append mode)
  const userCount = faker.number.int({ min: 3, max: 8 });
  console.log(`👥 Creating ${userCount} additional users...`);

  const users = [];
  for (let i = 0; i < userCount; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    // Ensure unique casLogin
    let casLogin = faker.internet
      .username({ firstName, lastName })
      .toLowerCase();
    let attempts = 0;
    while (
      (await prisma.user.findUnique({ where: { casLogin } })) &&
      attempts < 10
    ) {
      casLogin =
        faker.internet.username({ firstName, lastName }).toLowerCase() +
        faker.number.int({ min: 1, max: 999 });
      attempts++;
    }

    const user = await prisma.user.create({
      data: {
        casLogin,
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        role: faker.helpers.weightedArrayElement([
          { weight: 9, value: "student" },
          { weight: 1, value: "admin" },
        ]),
      },
    });
    users.push(user);
    console.log(`  ✓ Created user: ${user.casLogin} (${user.role})`);
  }

  console.log(`\n🚗 Creating mobilities for new users...`);

  let totalMobilities = 0;
  let totalTrips = 0;
  let totalSteps = 0;

  for (const user of users) {
    // Each user has 1-3 mobilities (fewer for append mode)
    const mobilityCount = faker.number.int({ min: 1, max: 3 });

    for (let m = 0; m < mobilityCount; m++) {
      const startCity = faker.helpers.arrayElement([
        ...FRENCH_CITIES,
        ...EUROPEAN_CITIES,
      ]);
      const endCity = faker.helpers.arrayElement(
        [...FRENCH_CITIES, ...EUROPEAN_CITIES].filter((c) => c !== startCity),
      );

      const mobility = await prisma.mobility.create({
        data: {
          name: `${startCity} → ${endCity}`,
          year: faker.date.between({ from: "2023-01-01", to: "2026-12-31" }),
          isPublic: faker.datatype.boolean(0.7), // 70% public
          isOriginal: faker.datatype.boolean(0.8), // 80% original
          startLocation: startCity,
          endLocation: endCity,
          userId: user.id,
        },
      });
      totalMobilities++;

      // Each mobility has 1-3 trips
      const tripCount = faker.number.int({ min: 1, max: 3 });
      const isSelectedIndex = faker.number.int({ min: 0, max: tripCount - 1 });

      for (let t = 0; t < tripCount; t++) {
        const trip = await prisma.trip.create({
          data: {
            name: generateTripName(),
            isSelected: t === isSelectedIndex,
            mobilityId: mobility.id,
          },
        });
        totalTrips++;

        // Each trip has 2-5 steps
        const stepCount = faker.number.int({ min: 2, max: 5 });

        for (let s = 0; s < stepCount; s++) {
          const startCoords = generateCoordinates();
          const endCoords = generateCoordinates();

          // Select transport mode for this step
          const transportMode = faker.helpers.arrayElement(TRANSPORT_MODES);
          const distance = getDistanceForMode(transportMode);
          const carbon = calculateCarbon(distance, transportMode.carbonFactor);

          const labelStart =
            s === 0 ? mobility.startLocation : generateLocationLabel();
          const labelEnd =
            s === stepCount - 1
              ? mobility.endLocation
              : generateLocationLabel();
          const metadata = JSON.stringify({
            duration: faker.number.int({ min: 5, max: 180 }),
            waitTime: faker.number.int({ min: 0, max: 30 }),
            comfort: faker.helpers.arrayElement(["low", "medium", "high"]),
            accessibility: faker.datatype.boolean(0.8),
          });

          // Use raw SQL for PostGIS geometry insertion
          await prisma.$queryRaw`
            INSERT INTO steps (
              id, sequence_order, label_start, label_end,
              point_start, point_end, carbon, distance, metadata,
              transport_mode, transport_carbon_factor, id_trip
            )
            VALUES (
              gen_random_uuid(),
              ${s + 1}::integer,
              ${labelStart}::text,
              ${labelEnd}::text,
              ST_GeomFromText(${`POINT(${startCoords.lng} ${startCoords.lat})`}, 4326),
              ST_GeomFromText(${`POINT(${endCoords.lng} ${endCoords.lat})`}, 4326),
              ${carbon}::double precision,
              ${distance}::double precision,
              ${metadata}::jsonb,
              ${transportMode.label}::text,
              ${transportMode.carbonFactor}::double precision,
              ${trip.id}::uuid
            )
          `;
          totalSteps++;
        }
      }
    }
  }

  const newUsers = await prisma.user.count();
  const newMobilities = await prisma.mobility.count();
  const newTrips = await prisma.trip.count();

  console.log("\n📊 Summary:");
  console.log(`  👥 Users: ${currentUsers} → ${newUsers} (+${users.length})`);
  console.log(
    `  🚗 Mobilities: ${currentMobilities} → ${newMobilities} (+${totalMobilities})`,
  );
  console.log(`  🛣️  Trips: ${currentTrips} → ${newTrips} (+${totalTrips})`);
  console.log(`  📍 Steps added: ${totalSteps}`);
  console.log("\n✨ Data appended successfully!\n");
}

main()
  .catch((e) => {
    console.error("❌ Error appending data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
