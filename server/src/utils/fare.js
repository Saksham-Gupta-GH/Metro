const { metroLines } = require('../data/metroData');

function getStops(line, from, to) {
  const stations = metroLines[line] || [];
  const fromIndex = stations.indexOf(from);
  const toIndex = stations.indexOf(to);

  if (fromIndex === -1 || toIndex === -1) {
    return 0;
  }

  return Math.abs(fromIndex - toIndex);
}

function findLineForStations(from, to) {
  return Object.keys(metroLines).find((line) => {
    const stations = metroLines[line] || [];
    return stations.includes(from) && stations.includes(to);
  });
}

function calculateFare(line, from, to, quantity) {
  const stops = getStops(line, from, to);
  const farePerTicket = Math.max(10, stops * 10);
  const totalFare = farePerTicket * Number(quantity || 1);

  return {
    stops,
    farePerTicket,
    totalFare,
  };
}

module.exports = {
  getStops,
  findLineForStations,
  calculateFare,
};
