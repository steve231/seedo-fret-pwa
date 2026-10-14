import React, { createContext, useContext, useState } from "react";
import type { ShipmentCategory } from "../lib/pricing";

export type OfferType = "eco" | "standard" | "express";

export interface ShipmentDraft {
  category: ShipmentCategory;
  weight: number;
  volume: number;
  origin: string;
  destination: string;
  distanceKm: number;
  when: "now" | "scheduled";
  scheduledAt: string;
  backhaul: boolean;
  selectedOffer: OfferType;
}

const DEFAULT_DRAFT: ShipmentDraft = {
  category: "general",
  weight: 12,
  volume: 25,
  origin: "Port Autonome de Cotonou",
  destination: "Marché de Gros, Calavi",
  distanceKm: 18,
  when: "now",
  scheduledAt: "",
  backhaul: true,
  selectedOffer: "standard",
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
