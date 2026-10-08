// OSM Nominatim geocoding + Haversine distance, ported from main's
// `geocodeLocationOSM`/Haversine fallback (used there when no Google Maps API
// key is configured). No Google Distance Matrix branch — OSM-only by design.

interface LatLon {
  lat: number;
  lon: number;
}

async function geocodeLocationOSM(query: string): Promise<LatLon | null> {
  const q = query.toLowerCase().includes("ahmedabad") ? query : `${query}, Ahmedabad, Gujarat, India`;
  try {
    const resp = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
      { headers: { "User-Agent": "ViharSevaGroup/1.0" } },
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** Returns the road-ish (straight-line Haversine) distance in km, rounded to
 * 1 decimal, or null if either location could not be geocoded. */
export async function calculateRoadDistance(from: string, to: string): Promise<number | null> {
  const [a, b] = await Promise.all([geocodeLocationOSM(from), geocodeLocationOSM(to)]);
  if (!a || !b) return null;
  const km = haversineKm(a.lat, a.lon, b.lat, b.lon);
  return Math.round(km * 10) / 10;
}
