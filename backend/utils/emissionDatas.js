const { getEmissionFactors } = require('./emissionFactors');

/**
 * Mapping from internal transport modes to Google Routes API travel modes
 */
const travelModeMap = {
  'car_gasoline': 'DRIVE',
  'car_diesel': 'DRIVE',
  'bus_urban': 'TRANSIT',
  'bus_long_haul': 'DRIVE',
  'train_high_speed': 'TRANSIT',
  'train_intercity': 'TRANSIT',
  'train_regional': 'TRANSIT',
  'train_international': 'TRANSIT',
  'transit': 'TRANSIT',
  'plane_medium_haul': 'DRIVE', // Fallback, though not used
  'plane_long_haul': 'DRIVE',
  'boat_short_haul': 'DRIVE',
  'boat_long_haul': 'DRIVE',
  'walk': 'WALK',
  'bike': 'BICYCLE'
};

/**
 * Calculates the great-circle distance between two points (Haversine formula)
 * Used for FLIGHT and BOAT modes where roads do not apply.
 */
const calculateHaversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Converts an address string to {lat, lng} using Google Geocoding API
 */
async function getCoordinates(address) {
  try {
    const apiKey = process.env.GMAPS_API_KEY;
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`);
    const data = await response.json();
    if (data.status !== "OK") {
      throw new Error(`Geocoding failed for "${address}": ${data.status}`);
    }
    const location = data.results[0].geometry.location;
    return { lat: location.lat, lng: location.lng };
  } catch (error) {
    console.error("Geocoding Error:", error.message);
    throw error;
  }
}

/**
 * Calculates distance and emissions
 * Decides between Google Routes API and Haversine
 */
async function getStepEstimation(data) {
  const { origin, destination, transportMode } = data;

  // Fetch carbon factor from CSV
  const factor = await getEmissionFactors(transportMode);
  if (factor === undefined) {
    throw new Error(`Emission factor not found for transport mode: ${transportMode}`);
  }

  let distanceKm = 0;
  let durationMin = 0;

  // Choose calculation method
  if (["plane_medium_haul", "plane_long_haul", "boat_short_haul", "boat_long_haul"].includes(transportMode)) {
    const startCoords = typeof origin === "string" ? await getCoordinates(origin) : origin;
    const endCoords = typeof destination === "string" ? await getCoordinates(destination) : destination;
    
    distanceKm = calculateHaversine(startCoords.lat, startCoords.lng, endCoords.lat, endCoords.lng);
    const speed = transportMode.startsWith('plane') ? 800 : 35; // 800 km/h for planes, 35 km/h for boats
    durationMin = (distanceKm / speed) * 60;
  } else {
    const googleTravelMode = travelModeMap[transportMode] || 'DRIVE';
    try {
      const response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
        method: "POST",
        headers: {
          "X-Goog-Api-Key": process.env.GMAPS_API_KEY,
          "Content-Type": "application/json",
          "X-Goog-FieldMask": "routes.distanceMeters,routes.duration",
        },
        body: JSON.stringify({
          origin: { address: origin },
          destination: { address: destination },
          travelMode: googleTravelMode,
        }),
      });
      
      const result = await response.json();
      if (!result.routes || result.routes.length === 0) {
        console.log("Résultat brut sans route:", result);
        throw new Error("No route found");
      }

      distanceKm = result.routes[0].distanceMeters / 1000;
      durationMin = parseInt(result.routes[0].duration) / 60;
        
    } catch (error) {
      console.error("ComputeRoutes Error:", error.message);
      throw error;
    }
  }

  return {
    carbon: parseFloat((distanceKm * factor).toFixed(2)),
    distance: parseFloat(distanceKm.toFixed(2)),
    time: Math.round(durationMin),
    transportCarbonFactor: factor,
  };
}

module.exports = { getStepEstimation };