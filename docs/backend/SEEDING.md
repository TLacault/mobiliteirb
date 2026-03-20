# Database Seeding Guide

This guide explains how to populate your database with realistic, randomized test data.

## Overview

The seed script generates coherent mobility data including:
- **Users** with unique CAS logins and emails
- **Mobilities** with realistic French and European city routes
- **Trips** with different route options for each mobility
- **Steps** with geographic coordinates, transport mode, and carbon metrics

## Features

✨ **Randomized Data**: Each run generates different amounts and variations of data
🌍 **Realistic Locations**: Uses real French and European cities
🚗 **16 Transport Modes**: Walking, cycling, public transit, cars, trains, flights
📊 **Coherent Metrics**: Distances and carbon emissions match transport modes
🔄 **Multiple Scenarios**: 5-15 users, 1-5 mobilities per user, 1-4 trips per mobility

## Quick Start

### Using Make (Recommended)

```bash
# Seed the database (clears existing data first)
make seed

# Reset database and seed with fresh data
make db-reset
```

### Using npm directly

```bash
# From the backend directory
cd backend

# Install dependencies (first time only)
npm install

# Run the seed script (clears first)
npm run seed

# Or use Prisma's built-in seeding
npm run db:seed

# Reset and reseed everything
npm run db:reset
```

### Using Docker

```bash
# Seed the database (clears first)
docker compose run --rm backend npm run seed

# Reset and reseed
docker compose run --rm backend npm run db:reset
```

## Generated Data Examples

### Users (5-15 per run)
- **casLogin**: `john.doe`, `marie.martin`, etc.
- **email**: Matching email addresses
- **role**: 90% students, 10% admins

### Mobilities (1-5 per user)
- **Routes**: Paris → Barcelona, Lyon → Berlin, etc.
- **Years**: Random dates between 2023-2026
- **Visibility**: 70% public, 30% private

### Trips (1-4 per mobility)
- **Names**: "Morning Route", "Express Journey", "Scenic Path", etc.
- **Selection**: One trip marked as selected per mobility

### Steps (2-8 per trip)
- **Locations**: Realistic station/stop names
- **Coordinates**: PostGIS POINT geometries (SRID 4326)
- **Distances**: Mode-appropriate (0.1-5000 km)
- **Transport Mode**: One of 16 available modes (see below)
- **Metadata**: Duration, wait time, comfort, accessibility

### Available Transport Modes

| Mode | Carbon Factor (kg CO₂/km) |
|------|---------------------------|
| Walking | 0.000 |
| Bicycle | 0.000 |
| E-Bike | 0.005 |
| Metro | 0.006 |
| Tram | 0.008 |
| Electric Scooter | 0.025 |
| Train (Regional) | 0.029 |
| Scooter | 0.084 |
| Bus | 0.089 |
| Car (Shared) | 0.096 |
| Train (TGV) | 0.003 |
| Flight (Long-haul) | 0.150 |
| Car/Taxi/Uber | 0.192 |
| Flight (Short-haul) | 0.255 |

## Customization

Edit `/backend/prisma/seed.js` to customize:

### Change data ranges
```javascript
// Line 82-83: Number of users
const userCount = faker.number.int({ min: 5, max: 15 });

// Line 104: Mobilities per user
const mobilityCount = faker.number.int({ min: 1, max: 5 });

// Line 121: Trips per mobility
const tripCount = faker.number.int({ min: 1, max: 4 });

// Line 136: Steps per trip
const stepCount = faker.number.int({ min: 2, max: 8 });
```

### Add more cities
```javascript
// Lines 6-14: Add to FRENCH_CITIES or EUROPEAN_CITIES arrays
const FRENCH_CITIES = [
  'Paris', 'Lyon', 'Marseille', 'YourCity', ...
];
```

### Modify transport modes
```javascript
// Lines 21-38: Add or modify transport modes
const TRANSPORT_MODES = [
  { label: 'Your Mode', carbonFactor: 0.123 },
  ...
];
```

## Database Operations

### View generated data

```bash
# Open Prisma Studio
docker compose up prisma-studio

# Or directly
npx prisma studio
```

Then visit: http://localhost:5555

### Query examples

```javascript
// Count users
await prisma.user.count()

// Find all admin users
await prisma.user.findMany({ where: { role: 'admin' } })

// Get mobilities with their trips
await prisma.mobility.findMany({
  include: { trips: true, user: true }
})

// Get full trip details
await prisma.trip.findFirst({
  include: {
    steps: {
      orderBy: { sequenceOrder: 'asc' }
    }
  }
})
```

## Troubleshooting

### Error: "Cannot find module '@faker-js/faker'"
```bash
cd backend
npm install
```

### Error: "Cannot find module './prisma/seed.js'"
Make sure you're running from the backend directory or using the make commands.

### Error: PostGIS extension issues
Ensure your PostgreSQL database has PostGIS enabled:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

## Integration with Development

### Automatic seeding on install
Already configured in `package.json` - runs automatically after migrations.

### Seed during CI/CD
```bash
npm run db:seed
```

### Environment-specific seeding
Set environment variables to control data volume:
```bash
SEED_USER_COUNT=20 npm run seed
```

## Tips

🎲 **Run multiple times**: Each execution creates different data
🧪 **Perfect for testing**: Generates edge cases automatically
📦 **No cleanup needed**: Each run starts fresh
🌱 **Development ready**: Populated database in seconds

Happy seeding! 🌱
