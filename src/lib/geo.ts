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

// Pays couverts par la recherche de lieux — Bénin (marché historique) +
// Côte d'Ivoire (expansion en cours). Étendu au fil de l'expansion
// géographique en Afrique de l'Ouest.
const SEARCH_COUNTRY_CODES = "bj,ci";

export interface PlaceResult {
  label: string;
  lat: number;
  lng: number;
  /** Code pays ISO alpha-2 en majuscules (ex: "BJ"), ou null si Nominatim ne l'a pas renseigné. */
  countryCode: string | null;
}

export async function searchPlaces(query: string): Promise<PlaceResult[]> {
  if (query.trim().length < 3) return [];

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "6");
  url.searchParams.set("countrycodes", SEARCH_COUNTRY_CODES);
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "fr");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Recherche de lieu impossible.");
  const data: { display_name: string; lat: string; lon: string; address?: { country_code?: string } }[] = await res.json();

  return data.map(d => ({
    label: d.display_name,
    lat: parseFloat(d.lat),
    lng: parseFloat(d.lon),
    countryCode: d.address?.country_code ? d.address.country_code.toUpperCase() : null,
  }));
}

export async function reverseGeocode(lat: number, lng: number): Promise<{ label: string; countryCode: string | null }> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "fr");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Impossible de déterminer l'adresse de cette position.");
  const data: { display_name?: string; address?: { country_code?: string } } = await res.json();
  if (!data.display_name) throw new Error("Aucune adresse trouvée pour cette position.");
  return {
    label: data.display_name,
    countryCode: data.address?.country_code ? data.address.country_code.toUpperCase() : null,
  };
}

/** Géolocalisation GPS du navigateur — gratuite, native, aucune clé. */
export function getCurrentPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("La géolocalisation n'est pas disponible sur cet appareil."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => {
        if (err.code === err.PERMISSION_DENIED) {
          reject(new Error("Accès à la position refusé — autorisez la géolocalisation dans votre navigateur."));
        } else {
          reject(new Error("Impossible d'obtenir votre position actuelle."));
        }
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  });
}

/** Hub le plus proche d'un point, parmi la liste fournie — utilisé pour le
 * matching par corridor (zone d'action des transporteurs). Calcul 100%
 * local (aucun appel réseau), à vol d'oiseau : suffisant pour désigner la
 * ville-hub la plus pertinente, pas pour un itinéraire. */
export function findNearestHub<T extends { lat: number; lng: number }>(
  point: { lat: number; lng: number },
  hubs: T[],
): T | null {
  if (hubs.length === 0) return null;
  let best = hubs[0];
  let bestDist = haversineKm(point, best);
  for (const hub of hubs.slice(1)) {
    const dist = haversineKm(point, hub);
    if (dist < bestDist) {
      best = hub;
      bestDist = dist;
    }
  }
  return best;
}

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
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
