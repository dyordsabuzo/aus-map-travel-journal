import { BlogMapPin } from "../../../types/BlogType";

// Helper to calculate distance between two lat/lng points (Haversine formula)
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate total travel mileage (sum of distances between consecutive pins)
export function calculateMileage(pins: BlogMapPin[]): number {
  if (pins.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < pins.length; i++) {
    total += haversineDistance(
      pins[i - 1].lat,
      pins[i - 1].lng,
      pins[i].lat,
      pins[i].lng,
    );
  }
  return Math.round(total * 10) / 10; // round to 1 decimal
}

// Get unique towns visited (by pin title)
export function getUniqueTowns(pins: BlogMapPin[]): string[] {
  const towns = new Set<string>();
  pins.forEach((pin) => {
    if (pin.title) towns.add(pin.title.trim());
  });
  return Array.from(towns);
}

// Count towns per state (assumes pin.category or tags include state info)
export function getTownsPerState(
  pins: BlogMapPin[],
  stateExtractor: (pin: BlogMapPin) => string | undefined,
): Record<string, number> {
  const stateCounts: Record<string, Set<string>> = {};
  pins.forEach((pin) => {
    const state = stateExtractor(pin);
    if (state) {
      if (!stateCounts[state]) stateCounts[state] = new Set();
      stateCounts[state].add(pin.title);
    }
  });
  // Convert Set counts to numbers
  const result: Record<string, number> = {};
  Object.entries(stateCounts).forEach(([state, towns]) => {
    result[state] = towns.size;
  });
  return result;
}
