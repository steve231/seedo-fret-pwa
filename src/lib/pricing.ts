/**
 * Moteur de dimensionnement & tarification — cahier des charges §5 et §9.
 * Seuils : léger ≤3,5t ; moyen >3,5 à 19t ; lourd >19t.
 * Formule : Forfait + (distance × coût_km) + (tonnage × coût_tonne), remise backhaul -20%.
 */

export const PRICING = {
  forfait: 40000,
  coutKm: 550,
  coutTonne: 4000,
  backhaulRemise: 0.20,
  vitesseKmh: 50,
} as const;

export type ShipmentCategory = "general" | "cement" | "perishable" | "liquid" | "container";

export const CATEGORIES: { value: ShipmentCategory; label: string }[] = [
  { value: "general", label: "Marchandise Générale (Sacs, Cartons)" },
  { value: "cement", label: "Ciment / Matériaux de Construction" },
  { value: "perishable", label: "Produits Périssables (Chaîne du Froid)" },
  { value: "liquid", label: "Liquides / Citerne" },
  { value: "container", label: "Conteneur (20ft / 40ft)" },
];

export function dimensionVehicle(weightTonnes: number): { type: string; capacity: number } {
  if (weightTonnes <= 3.5) return { type: "Petit Camion Bâché (3,5t)", capacity: 3.5 };
  if (weightTonnes <= 19) return { type: "Camion Moyen Bâché (15t)", capacity: 15 };
  return { type: "Semi-Remorque Plateau/Bâché (35t)", capacity: 35 };
}

export function vehicleCount(weightTonnes: number, capacity: number): number {
  return Math.max(1, Math.ceil(weightTonnes / capacity));
}

export interface Quote {
  eco: number;
  standard: number;
  express: number;
}

export function computeQuote(weightTonnes: number, distanceKm: number, backhaul: boolean): Quote {
  let base = PRICING.forfait + distanceKm * PRICING.coutKm + weightTonnes * PRICING.coutTonne;
  if (backhaul) base *= 1 - PRICING.backhaulRemise;
  return {
    eco: Math.round(base * 0.85),
    standard: Math.round(base),
    express: Math.round(base * 1.2),
  };
}

export function formatFcfa(n: number): string {
  return Math.round(n).toLocaleString("fr-FR") + " FCFA";
}

export function etaLabel(distanceKm: number, speedFactor = 1): string {
  const hours = (distanceKm / PRICING.vitesseKmh) * speedFactor;
  return hours < 1 ? `${Math.max(1, Math.round(hours * 60))} min` : `${hours.toFixed(1)} h`;
}
