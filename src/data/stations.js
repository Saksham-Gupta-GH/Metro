// Minimal stations and helpers for Smart Ticketing UI
export const STATIONS = [
  'Majestic',
  'KR Puram',
  'Indiranagar',
  'MG Road',
  'Yeshwanthpur',
  'Banashankari',
  'Silk Institute',
  'Whitefield',
  'Electronic City',
  'Bommasandra',
];

export function stationCount(from, to) {
  const i = STATIONS.indexOf(from);
  const j = STATIONS.indexOf(to);
  if (i === -1 || j === -1 || i === j) return 1;
  return Math.abs(i - j);
}
