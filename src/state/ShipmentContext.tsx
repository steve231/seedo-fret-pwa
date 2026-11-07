import React, { createContext, useContext, useState } from "react";
import type { ShipmentCategory } from "../lib/pricing";

export type OfferType = "eco" | "standard" | "express";

export interface BackendOffer {
  id: string;
  type: OfferType;
  price_fcfa: number;
  eta_minutes: number;
  vehicle_gabarit_required: string;
}

export interface PriceBreakdown {
  forfait_fcfa: number;
  distance_cost_fcfa: number;
  tonnage_cost_fcfa: number;
  backhaul_discount_pct: number;
  deferred_payment_markup_pct: number;
}

export interface ShipmentDraft {
  category: ShipmentCategory;
  weight: number;
  volume: number;
  origin: string;
  originLat: number | null;
  originLng: number | null;
  destination: string;
  destinationLat: number | null;
  destinationLng: number | null;
  // Calculée automatiquement (distance routière réelle via OSRM) dès que
  // départ et destination sont sélectionnés — jamais saisie à la main.
  distanceKm: number;
  when: "now" | "scheduled";
  scheduledAt: string;
  backhaul: boolean;
  selectedOffer: OfferType;

  // Renseignés par le backend une fois la cotation calculée (POST /quote
  // puis POST /offers) — null tant que l'étape "Offres" n'a pas tourné.
  quoteId: string | null;
  offers: BackendOffer[] | null;
  paymentMode: "immediate" | "deferred" | null;
  paymentTermsDays: number;
  breakdown: PriceBreakdown | null;
}

const DEFAULT_DRAFT: ShipmentDraft = {
  category: "general",
  weight: 12,
  volume: 25,
  origin: "",
  originLat: null,
  originLng: null,
  destination: "",
  destinationLat: null,
  destinationLng: null,
  distanceKm: 0,
  when: "now",
  scheduledAt: "",
  backhaul: true,
  selectedOffer: "standard",
  quoteId: null,
  offers: null,
  paymentMode: null,
  paymentTermsDays: 0,
  breakdown: null,
};

interface ShipmentContextValue {
  draft: ShipmentDraft;
  update: (patch: Partial<ShipmentDraft>) => void;
  reset: () => void;
}

const ShipmentContext = createContext<ShipmentContextValue | null>(null);

export function ShipmentProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<ShipmentDraft>(DEFAULT_DRAFT);

  const update = (patch: Partial<ShipmentDraft>) => setDraft(d => ({ ...d, ...patch }));
  const reset = () => setDraft(DEFAULT_DRAFT);

  return (
    <ShipmentContext.Provider value={{ draft, update, reset }}>
      {children}
    </ShipmentContext.Provider>
  );
}

export function useShipment(): ShipmentContextValue {
  const ctx = useContext(ShipmentContext);
  if (!ctx) throw new Error("useShipment doit être utilisé dans un ShipmentProvider");
  return ctx;
}
