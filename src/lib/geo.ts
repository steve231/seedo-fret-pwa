/**
 * Géolocalisation 100% gratuite, sans clé API — écosystème OpenStreetMap
 * (déjà validé sur SAMAPASS : flutter_map + Nominatim). Nominatim pour la
 * recherche de lieux, OSRM pour la distance routière réelle (pas à vol
 * d'oiseau, important pour que le prix reflète le vrai trajet).
 *
 * Ce sont des instances publiques et gratuites, avec une politique d'usage
 * raisonnable (~1 req/s) — largement suffisant pour un pilote. À l'échelle,
 * elles s'auto-hébergent (toujours gratuit en logiciel).
 */

export interface PlaceResult {
  label: string;
  lat: number;
  lng: number;
}

export async function searchPlaces(query: string): Promise<PlaceResult[]> {
  if (query.trim().length < 3) return [];

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "6");
  url.searchParams.set("countrycodes", "bj"); // Bénin
  url.searchParams.set("accept-language", "fr");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Recherche de lieu impossible.");
  const data: { display_name: string; lat: string; lon: string }[] = await res.json();

  return data.map(d => ({
    label: d.display_name,
    lat: parseFloat(d.lat),
    lng: parseFloat(d.lon),
  }));
}

export async function getDrivingDistanceKm(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
): Promise<number> {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${origin.lng},${origin.lat};${destination.lng},${destination.lat}` +
    `?overview=false`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Calcul de distance impossible.");
  const data = await res.json();
  if (data.code !== "Ok" || !data.routes?.[0]) {
    throw new Error("Aucun itinéraire routier trouvé entre ces deux points.");
  }
  return data.routes[0].distance / 1000; // mètres -> km
}
