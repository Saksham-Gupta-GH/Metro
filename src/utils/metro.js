import { metroLines } from '../data/metroLines';

export const lineColors = {
  'Purple Line': '#7c3aed',
  'Green Line': '#16a34a',
  'Blue Line': '#2563eb',
  'Pink Line': '#ec4899',
  'Yellow Line': '#eab308',
};

export const allStations = Array.from(new Set(Object.values(metroLines).flat()));

export function findLineForStations(from, to) {
  return Object.keys(metroLines).find((line) => {
    const stations = metroLines[line] || [];
    return stations.includes(from) && stations.includes(to);
  });
}

export function calculateLocalJourney(from, to, ticketType = 'single') {
  const directLine = findLineForStations(from, to);

  if (directLine) {
    const stations = metroLines[directLine];
    const hops = Math.abs(stations.indexOf(from) - stations.indexOf(to));
    const singleFare = 10 + hops * 2;

    return {
      line: directLine,
      hops,
      fare: ticketType === 'return' ? Number((singleFare * 1.8).toFixed(2)) : singleFare,
      distance: Number((hops * 1.4).toFixed(1)),
      travelTime: hops * 3 + 4,
      interchangeRequired: false,
      interchangeStation: '',
    };
  }

  const sourceLines = Object.keys(metroLines).filter((line) => metroLines[line].includes(from));
  const destinationLines = Object.keys(metroLines).filter((line) => metroLines[line].includes(to));

  for (const sourceLine of sourceLines) {
    for (const destinationLine of destinationLines) {
      const interchange = metroLines[sourceLine].find((station) => metroLines[destinationLine].includes(station));

      if (interchange) {
        const firstLeg = Math.abs(metroLines[sourceLine].indexOf(from) - metroLines[sourceLine].indexOf(interchange));
        const secondLeg = Math.abs(metroLines[destinationLine].indexOf(interchange) - metroLines[destinationLine].indexOf(to));
        const hops = firstLeg + secondLeg;
        const singleFare = 10 + hops * 2;

        return {
          line: sourceLine,
          hops,
          fare: ticketType === 'return' ? Number((singleFare * 1.8).toFixed(2)) : singleFare,
          distance: Number((hops * 1.4).toFixed(1)),
          travelTime: hops * 3 + 8,
          interchangeRequired: true,
          interchangeStation: interchange,
        };
      }
    }
  }

  return null;
}
