import { api } from "./api";

export interface Country {
  code: string;
  name: string;
}

export interface Hub {
  id: string;
  country_code: string;
  name: string;
  lat: number;
  lng: number;
}

// Référentiel géré par SEEDO (pays + villes-hubs) — change rarement,
// mis en cache en mémoire pour éviter de le recharger à chaque écran.
let countriesCache: Promise<Country[]> | null = null;
let hubsCache: Promise<Hub[]> | null = null;

export function getCountries(): Promise<Country[]> {
  if (!countriesCache) countriesCache = api.get<Country[]>("/zones/countries");
  return countriesCache;
}

export function getHubs(): Promise<Hub[]> {
  if (!hubsCache) hubsCache = api.get<Hub[]>("/zones/hubs");
  return hubsCache;
}
