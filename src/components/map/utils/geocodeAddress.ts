/**
 * Geocode an address using OpenStreetMap Nominatim API.
 * Returns { lat, lng, displayName } if found, otherwise null.
 */
export async function geocodeAddress(address: string): Promise<{
  lat: number;
  lng: number;
  displayName: string;
} | null> {
  if (!address.trim()) return null;

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,
    );
    const data = await response.json();

    if (data && data.length > 0) {
      const { lat, lon, display_name } = data[0];
      return {
        lat: parseFloat(lat),
        lng: parseFloat(lon),
        displayName: display_name || address,
      };
    }
    return null;
  } catch (error) {
    return null;
  }
}
