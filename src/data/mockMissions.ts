export interface Mission {
  id: string;
  origin: string;
  destination: string;
  distanceKm: number;
  cargoLabel: string;
  weight: number;
  price: number;
  backhaul: boolean;
  pickupWindow: string;
  offerType: "eco" | "standard" | "express";
}

export const MOCK_MISSIONS: Mission[] = [
  {
    id: "SF-8902",
    origin: "Port Autonome de Cotonou",
    destination: "Marché de Gros, Calavi",
    distanceKm: 18,
    cargoLabel: "Marchandise Générale (Cartons)",
    weight: 12,
    price: 107200,
    backhaul: true,
    pickupWindow: "Aujourd'hui, avant 18h",
    offerType: "standard",
  },
  {
    id: "SF-8917",
    origin: "Zone Industrielle, Akpakpa",
    destination: "Godomey Carrefour",
    distanceKm: 14,
    cargoLabel: "Ciment / Matériaux BTP",
    weight: 18,
    price: 137200,
    backhaul: false,
    pickupWindow: "Demain, 08h - 10h",
    offerType: "express",
  },
];

export const CURRENT_MISSION: {
  id: string;
  shipperName: string;
  shipperPhone: string;
  cargoLabel: string;
  weight: number;
  origin: string;
  destination: string;
  price: number;
} = {
  id: "SF-8902",
  shipperName: "Logistique Bénin SA",
  shipperPhone: "+229 01 92 00 45 03",
  cargoLabel: "Marchandise Générale (Cartons)",
  weight: 12,
  origin: "Port Autonome de Cotonou",
  destination: "Marché de Gros, Calavi",
  price: 107200,
};
