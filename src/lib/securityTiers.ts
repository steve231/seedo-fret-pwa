import { api } from "./api";

export interface SecurityTier {
  code: string;
  name: string;
  description: string;
  rank: number;
  surcharge_fcfa: number;
  requires_gps: boolean;
  requires_camera: boolean;
}

// Référentiel géré par SEEDO (paliers de sécurité actifs) — change
// rarement, mis en cache en mémoire pour éviter de le recharger à chaque écran.
let tiersCache: Promise<SecurityTier[]> | null = null;

export function getSecurityTiers(): Promise<SecurityTier[]> {
  if (!tiersCache) tiersCache = api.get<SecurityTier[]>("/security-tiers");
  return tiersCache;
}
