# 🌱 Database Seeding - Quick Reference

## Commands Cheatsheet

| Command | Action | When to Use |
|---------|--------|-------------|
| `make seed` | Clear DB + Generate mobility data | Fresh start, testing from scratch |
| `make db-reset` | Reset migrations + Seed | Schema changed, need clean slate |

## What Gets Generated

Each run creates RANDOM amounts:

  👤 0 User created by seed (uses an existing user account)
    ↓
  🚗 3-8 Mobilities
    ↓
  🛣️  1-3 Trips per mobility
    ↓
  📍 2-5 Steps per trip (each with one transport mode)
- Lyon → Berlin
- Toulouse → Amsterdam

**Transport Modes** (with carbon factors)
- 🚶 Walking: 0.000 kg/km
- 🚴 Bicycle: 0.000 kg/km
- 🚇 Metro: 0.006 kg/km
- 🚄 TGV: 0.003 kg/km
- 🚗 Car: 0.192 kg/km
- ✈️ Flight: 0.150-0.255 kg/km

## Quick Checks

```bash
# View data in browser
docker compose up prisma-studio
# Visit: http://localhost:5555

# Count records
docker compose run --rm backend npx prisma db seed
```

## Customization

Edit these files:
- `/backend/prisma/seed.js` - Main seed script (clears DB)

Common changes:
```javascript
// More users
const userCount = faker.number.int({ min: 10, max: 30 });

// More cities
const FRENCH_CITIES = ['Paris', 'Lyon', 'YourCity', ...];

// Custom transport mode
{ label: 'Hoverboard', carbonFactor: 0.01 }
```

## Troubleshooting

❌ **"Cannot find module '@faker-js/faker'"**
```bash
cd backend && npm install
```

❌ **"PostGIS error"**
```sql
-- Run in your PostgreSQL:
CREATE EXTENSION IF NOT EXISTS postgis;
```

❌ **"Unique constraint violation"**
→ Use `make seed` (clears first)

## Tips

💡 Run `make seed` multiple times to see different data
💡 Check generated data with Prisma Studio
💡 Carbon emissions auto-calculated from distances

---

📚 **Full documentation**: [SEEDING.md](SEEDING.md)
