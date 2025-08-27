/**
 * geocode.ts
 * Utility for geocoding addresses using OpenStreetMap Nominatim.
 */
import { logger } from "./logger";

export interface GeocodeResult {
  lat: number;
  lon: number;
  displayName: string;
}

/**
 * Geocode an address using OpenStreetMap Nominatim.
 * @param address The address to geocode.
 * @returns {Promise<GeocodeResult | null>} The coordinates and display name, or null if not found.
 */
export async function geocodeAddress(
  address: string
): Promise<GeocodeResult | null> {
  if (!address.trim()) return null;
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    address
  )}`;
  logger.info("Geocoding address:", address);
  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });
    const data = await response.json();
    if (data && data.length > 0) {
      const result = data[0];
      logger.success("Geocoding successful:", {
        address,
        lat: result.lat,
        lon: result.lon,
      });
      return {
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
        displayName: result.display_name || address,
      };
    }
    logger.warn("Geocoding: Address not found", address);
    return null;
  } catch (err) {
    logger.error("Geocoding error:", err);
    return null;
  }
}
