const { getEmissionFactors, getEmissionsCO2 } = require('./emissionCO2');

/**
 * Mapping from internal transport modes to Google Routes API travel modes
 */
const travelModeMap = {
  'plane': 'DRIVE',             // Fallback, though not used
  'train_high_speed': 'TRANSIT',
  'train_intercity': 'TRANSIT',
  'car_gasoline': 'DRIVE',
  'car_electric': 'DRIVE',
  'bus_gasoline_long_haul': 'DRIVE',
  'bike': 'BICYCLE',
  'bike_electric': 'BICYCLE',
  'bus_gasoline': 'TRANSIT',
  'tram': 'TRANSIT',
  'metro': 'TRANSIT',
  'scooter_gasoline': 'DRIVE',
  'motorcycle_gasoline': 'DRIVE',
  'train_paris': 'TRANSIT',
  'train_regional': 'TRANSIT',
  'bus_electric': 'TRANSIT',
  'car_gasoline_1_passenger': 'DRIVE',
  'car_gasoline_2_passengers': 'DRIVE',
  'car_gasoline_3_passengers': 'DRIVE',
  'car_gasoline_4_passengers': 'DRIVE',
  'car_electric_1_passenger': 'DRIVE',
  'car_electric_2_passengers': 'DRIVE',
  'car_electric_3_passengers': 'DRIVE',
  'car_electric_4_passengers': 'DRIVE',
  'walk': 'WALK'
};

/**
 * Calculates the great-circle distance between two points (Haversine formula)
 * Used for FLIGHT modes where roads do not apply.
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

  let distanceKm = 0;
  let durationMin = 0;

  if (["plane"].includes(transportMode)) {
    try {
      const startCoords = typeof origin === "string" ? await getCoordinates(origin) : origin;
      const endCoords = typeof destination === "string" ? await getCoordinates(destination) : destination;
      
      distanceKm = calculateHaversine(startCoords.lat, startCoords.lng, endCoords.lat, endCoords.lng);
      const speed = 800; // 800 km/h for planes mean speed
      durationMin = ((distanceKm / speed) * 60) + 40; //40min for take-off and landing phases
    } catch (error) {
      console.error("Geocoding error for plane/boat:", error.message);
      throw new Error(`Impossible de géolocaliser les adresses "${origin}" ou "${destination}". Vérifiez l'orthographe.`);
    }
  } else {
    const googleTravelMode = travelModeMap[transportMode] || 'DRIVE';
    try {
      const nextMonday = new Date();
      nextMonday.setDate(nextMonday.getDate() + ((7 - nextMonday.getDay() + 1) % 7 || 7));
      nextMonday.setHours(9, 0, 0, 0);

      const requestBody = {
        origin: { address: origin },
        destination: { address: destination },
        travelMode: googleTravelMode,
      };

      if (googleTravelMode === 'TRANSIT') {
        requestBody.departureTime = nextMonday.toISOString();

        const transitModeMapping = {
          'tram': ["LIGHT_RAIL"],
          'metro': ["SUBWAY"],
          'bus_gasoline': ["BUS"],
          'bus_electric': ["BUS"],
          'train_paris': ["RAIL"],
          'train_regional': ["RAIL"],
          'train_intercity': ["RAIL"],
          'train_high_speed': ["RAIL"]
        };

        requestBody.transitPreferences = {
          routingPreference: "FEWER_TRANSFERS",
          allowedTravelModes: transitModeMapping[transportMode]
        };

      }

      if (googleTravelMode === 'DRIVE') {
        requestBody.routingPreference = "TRAFFIC_AWARE_OPTIMAL";
      }

      const response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
        method: "POST",
        headers: {
          "X-Goog-Api-Key": process.env.GMAPS_API_KEY,
          "Content-Type": "application/json",
          "X-Goog-FieldMask": "routes.distanceMeters,routes.duration",
        },
        body: JSON.stringify(requestBody)
      });
      
      const result = await response.json();
      if (!response.ok) {
        console.error("Google Routes API error:", result);
        throw new Error(`Erreur API Google Maps (${response.status}). Vérifiez votre quota ou votre clé API.`);
      }
      if (!result.routes || result.routes.length === 0) {
        console.log("No route found:", result);
        throw new Error(`Aucun itinéraire trouvé ${googleTravelMode} entre "${origin}" et "${destination}". Essayez un autre mode de transport ou vérifiez les adresses.`);
      }

      distanceKm = result.routes[0].distanceMeters / 1000;
      if ((['tram', 'metro', 'bus_gasoline', 'bus_electric'].includes(transportMode) && distanceKm > 100) || (['train_paris'].includes(transportMode) && distanceKm > 150)) {
        throw new Error(`Le mode "${transportMode}" n'est pas réaliste pour une distance de ${Math.round(distanceKm)}km.`);
      }
      durationMin = parseInt(result.routes[0].duration) / 60;
      if (transportMode === 'bus_gasoline_long_haul')
        durationMin *= 1.2;
        
    } catch (error) {
      console.error("ComputeRoutes Error:", error.message);
      if (error.message.includes('Aucun itinéraire') || error.message.includes('Erreur API')) {
        throw error;
      }
      throw new Error(`Erreur lors du calcul de l'itinéraire : ${error.message}`);
    }
  }

  let carbonEmissions = 0;
  
  try {
    carbonEmissions = await getEmissionsCO2(distanceKm, transportMode);
  } catch (error) {
    console.error("Error calculating emissions:", error.message);
    throw new Error(`Impossible de calculer les émissions CO₂ pour le mode "${transportMode}". Vérifiez que ce mode est supporté.`);
  }


  return {
    carbon: parseFloat(carbonEmissions),
    distance: parseFloat(distanceKm.toFixed(2)),
    time: Math.round(durationMin),
  };
}

module.exports = { getStepEstimation };