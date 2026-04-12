import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

// 5 predefined cities with real coordinates
const CITIES = [
  { name: "Bordeaux", lat: 44.8378, lng: -0.5792 },
  { name: "Paris", lat: 48.8566, lng: 2.3522 },
  { name: "New York", lat: 40.7128, lng: -74.006 },
  { name: "Tokyo", lat: 35.6762, lng: 139.6503 },
  { name: "Sydney", lat: -33.8688, lng: 151.2093 },
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

function generateCoordinatesNear(city) {
  return {
    lat: city.lat + faker.number.float({ min: -0.05, max: 0.05 }),
    lng: city.lng + faker.number.float({ min: -0.05, max: 0.05 }),
  };
}

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

function calculateCarbon(distance, carbonFactor) {
  return parseFloat((distance * carbonFactor).toFixed(3));
}

function getDurationForMode(mode, distance) {
  const label = mode.label.toLowerCase();
  let speed;
  if (label.includes("walk")) speed = 5;
  else if (label.includes("bicycle") || label.includes("scooter")) speed = 15;
  else if (
    label.includes("bus") ||
    label.includes("metro") ||
    label.includes("tram")
  )
    speed = 20;
  else if (label.includes("train (regional)")) speed = 80;
  else if (label.includes("tgv")) speed = 250;
  else if (label.includes("car")) speed = 60;
  else if (label.includes("flight")) speed = 800;
  else speed = 30;

  const hours = distance / speed;
  return Math.round(hours * 60);
}

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

function generateLocationLabel(cityName) {
  const placeTypes = [
    "Station",
    "Stop",
    "Terminal",
    "Airport",
    "Hub",
    "Center",
    "Plaza",
  ];
  return `${cityName} ${faker.helpers.arrayElement(placeTypes)}`;
}

// Pick two different cities from the predefined list
function pickTwoCities() {
  const start = faker.helpers.arrayElement(CITIES);
  const end = faker.helpers.arrayElement(
    CITIES.filter((c) => c.name !== start.name),
  );
  return { start, end };
}

async function main() {
  console.log("🎓 Creating 10 student users with 5 mobilities each...\n");

  const timeColumnCheck = await prisma.$queryRaw`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'steps'
        AND column_name = 'time'
    ) AS "exists"
  `;
  const hasStepTimeColumn = Boolean(timeColumnCheck?.[0]?.exists);

  if (!hasStepTimeColumn) {
    console.log(
      "ℹ️  Column steps.time not found, storing duration only in metadata.duration",
    );
  }

  let totalUsers = 0;
  let totalMobilities = 0;
  let totalTrips = 0;
  let totalSteps = 0;

  for (let u = 0; u < 10; u++) {
    const casLogin = `student${u + 1}`;
    const email = `${casLogin}@enseirb-matmeca.fr`;

    // Create or find user (upsert to be idempotent)
    const user = await prisma.user.upsert({
      where: { casLogin },
      update: {},
      create: {
        casLogin,
        email,
        role: "student",
      },
    });
    totalUsers++;
    console.log(`👤 User ${casLogin} (${user.id})`);

    // 5 mobilities per user, each using predefined cities
    for (let m = 0; m < 5; m++) {
      const { start: startCity, end: endCity } = pickTwoCities();

      const mobility = await prisma.mobility.create({
        data: {
          name: `${startCity.name} → ${endCity.name}`,
          year: faker.date.between({ from: "2023-01-01", to: "2026-12-31" }),
          isAnonymous: faker.datatype.boolean(0.3),
          startLocation: startCity.name,
          endLocation: endCity.name,
          userId: user.id,
        },
      });
      totalMobilities++;

      // Each mobility has 5-7 trips
      const tripCount = faker.number.int({ min: 5, max: 7 });
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
          const startCoords = generateCoordinatesNear(startCity);
          const endCoords = generateCoordinatesNear(endCity);

          const transportMode = faker.helpers.arrayElement(TRANSPORT_MODES);
          const distance = getDistanceForMode(transportMode);
          const carbon = calculateCarbon(distance, transportMode.carbonFactor);
          const durationMinutes = getDurationForMode(transportMode, distance);

          const labelStart =
            s === 0
              ? startCity.name
              : generateLocationLabel(faker.helpers.arrayElement(CITIES).name);
          const labelEnd =
            s === stepCount - 1
              ? endCity.name
              : generateLocationLabel(faker.helpers.arrayElement(CITIES).name);
          const metadata = JSON.stringify({
            duration: durationMinutes,
            waitTime: faker.number.int({ min: 0, max: 30 }),
            comfort: faker.helpers.arrayElement(["low", "medium", "high"]),
            accessibility: faker.datatype.boolean(0.8),
          });

          if (hasStepTimeColumn) {
            await prisma.$queryRaw`
              INSERT INTO steps (
                id, sequence_order, label_start, label_end,
                point_start, point_end, carbon, distance, metadata,
                time, transport_mode, transport_carbon_factor, id_trip
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
                ${durationMinutes}::integer,
                ${transportMode.label}::text,
                ${transportMode.carbonFactor}::double precision,
                ${trip.id}::uuid
              )
            `;
          } else {
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
          }
          totalSteps++;
        }
      }
    }
  }

  console.log("\n📊 Summary:");
  console.log(`  👥 Users: ${totalUsers}`);
  console.log(`  🚗 Mobilities: ${totalMobilities}`);
  console.log(`  🛣️  Trips: ${totalTrips}`);
  console.log(`  📍 Steps: ${totalSteps}`);
  console.log(`  🌍 Cities used: ${CITIES.map((c) => c.name).join(", ")}`);
  console.log("\n✨ Student data seeded successfully!\n");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding student data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
