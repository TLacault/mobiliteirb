const fs = require("fs");
const path = require("path");
/**
 * Parses the ADEME CSV text and returns a dictionary of emission factors.
 * Logic based on "Base_Carbone_V23.9_filtree.csv"
 * @param {string} csvData 
 * @returns {Object} Dictionary of { transport_mode: factor_in_kgCO2e_per_km }
 */
async function getAllEmissionFactors() {
    const csvPath = path.resolve(__dirname, "baseCarbone/Base_Carbone_V23.9_filtree.csv");

    if (!fs.existsSync(csvPath)) {
        throw new Error(`File not found at: ${csvPath}`);
    }

    const csvData = fs.readFileSync(csvPath, "utf-8");

    const emissionMap = {};
    emissionMap['walk'] = 0;
    emissionMap['bike'] = 0;

    const lines = csvData.split('\n');

    lines.forEach(line => {
        const columns = line.split(';');
        if (columns.length < 5) return;

        const name = columns[0].trim();
        const category = columns[1].trim();
        const location = columns[3].trim();
        const factor = parseFloat(columns[4].trim().replace(',', '.'));

        // TRAINS
        if (name === 'TGV') emissionMap['train_high_speed'] = factor;
        if (name === 'Intercités') emissionMap['train_intercity'] = factor;
        if (name === 'TER') emissionMap['train_regional'] = factor;
        if (name === 'Train de voyageurs' && location.includes('Autre pays')) {
            emissionMap['train_international'] = factor;
        }

        // BUS
        if (name === 'Autobus moyen') emissionMap['bus_urban'] = factor;
        if (name === 'Autocar') emissionMap['bus_long_haul'] = factor;

        // URBAN ELECTRIC TRANSIT
        if (name === 'Métro, tramway, trolleybus') emissionMap['transit'] = factor;

        // BOATS        
        if (name === 'Navette fluviale') emissionMap['boat_short_haul'] = factor;
        if (name === 'Navette inter-îles') emissionMap['boat_long_haul'] = factor;

        // CARS
        if (name === 'Voiture essence') emissionMap['car_gasoline'] = factor;
        if (name === 'Voiture gazole') emissionMap['car_diesel'] = factor;

        // PLANES
        if (name === 'Avion passagers') {
            if (category.includes('101-220 sièges')) emissionMap['plane_medium_haul'] = factor;
            if (category.includes('>220 sièges')) emissionMap['plane_long_haul'] = factor;
        }
    });

    return emissionMap;
};

/**
 * Return the emission factor for a given transport mode.
 * @param {string} transport_mode - A transport mode ('train_high_speed', 'car_gasoline', etc.)
 * @returns {Promise<number>} The emission factor for the given transport mode.
 */
async function getEmissionFactors(transport_mode) {
    const emissionMap = await getAllEmissionFactors();
    return emissionMap[transport_mode] || 0; // Default to 0 if not found
}

module.exports = { 
    getAllEmissionFactors,
    getEmissionFactors
};