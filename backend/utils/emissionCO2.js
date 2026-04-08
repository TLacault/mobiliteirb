/**
 * Mapping transport mode with API transport ID
*/
const TRANSPORT_MODE_API_ID = {
  'plane': 1,
  'train_high_speed': 2,
  'train_intercity': 3,
  'car_gasoline': 4,
  'car_electric': 5,
  'bus_gasoline_long_haul': 6,
  'bike': 7,
  'bike_electric': 8,
  'bus_gasoline': 9,
  'tram': 10,
  'metro': 11,
  'scooter_gasoline': 12,
  'motorcycle_gasoline': 13,
  'train_paris': 14,
  'train_regional': 15,
  'bus_electric': 16,
  'car_gasoline_1_passenger': 22,
  'car_gasoline_2_passengers': 23,
  'car_gasoline_3_passengers': 24,
  'car_gasoline_4_passengers': 25,
  'car_electric_1_passenger': 26,
  'car_electric_2_passengers': 27,
  'car_electric_3_passengers': 28,
  'car_electric_4_passengers': 29,
  'walk': 30
};

/**
 * Get emissions CO2 from API Impact CO2
 * @param {number} distanceKm - Distance in km
 * @param {string} transportMode - Transport mode
 * @returns {Promise<number>} Emissions CO2 in kgCO2e
*/
async function getEmissionsCO2(distanceKm, transportMode) {
  const apiTransportId = TRANSPORT_MODE_API_ID[transportMode];
  
  const baseUrl = 'https://impactco2.fr/api/v1/transport';
  const params = new URLSearchParams({
    km: distanceKm.toString(),
    displayAll: '0',                        // Only display results for transport mode given
    transports: apiTransportId.toString(),
    ignoreRadiativeForcing: '0',            // Include radiative forcing in emissions calculation
    occupencyRate: '1',                     
    includeConstruction: '0',               // Not include construction emissions
    language: 'en',                         // English
  });
  
  const url = `${baseUrl}?${params.toString()}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${process.env.IMPACT_CO2_API_KEY}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`API Impact CO2 returned status ${response.status}`);
    }
    const result = await response.json();
    
    if (!result.data || result.data.length === 0) {
      throw new Error(`No emission data returned for transport mode: ${transportMode}`);
    }
    const emissionValue = result.data[0].value;
    console.log(`Emissions for ${transportMode} (${distanceKm}km): ${emissionValue} kgCO2e`);
    
    return emissionValue;
    
  } catch (error) {
    console.error(`Error fetching emissions from Impact CO2 API:`, error.message);    
    throw error;
  }
}

module.exports = {
  getEmissionsCO2,
  TRANSPORT_MODE_API_ID,
};