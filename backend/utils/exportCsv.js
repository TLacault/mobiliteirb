/**
 * CSV export utilities for mobility data.
 */

const escapeCsv = (value) => {
  const str = String(value ?? "");
  return `"${str.replace(/"/g, '""')}"`;
};

/**
 * Build a CSV string from a mobility object (selected trips + steps).
 * @param {Object} mobility
 * @returns {string}
 */
function generateMobilityCsv(mobility) {
  const rows = [
    [
      "mobilityId",
      "mobilityName",
      "year",
      "startLocation",
      "endLocation",
      "tripId",
      "tripName",
      "tripIsSelected",
      "stepOrder",
      "transportMode",
      "labelStart",
      "labelEnd",
      "distance",
      "time",
      "carbon",
    ],
  ];

  (mobility.trips || []).forEach((trip) => {
    (trip.steps || []).forEach((step) => {
      rows.push([
        mobility.id,
        mobility.name,
        mobility.year ? new Date(mobility.year).toISOString().slice(0, 10) : "",
        mobility.startLocation,
        mobility.endLocation,
        trip.id,
        trip.name,
        trip.isSelected,
        step.sequenceOrder,
        step.transportMode,
        step.labelStart,
        step.labelEnd,
        step.distance,
        step.time,
        step.carbon,
      ]);
    });
  });

  return rows
    .map((row) => row.map((cell) => escapeCsv(cell)).join(","))
    .join("\n");
}

module.exports = { generateMobilityCsv };
