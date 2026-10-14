export interface ShipmentRecord {
  id: string;
  route: string;
  origin: string;
  destination: string;
  date: string;
  status: "En cours" | "Livré" | "Annulé";
  cargoLabel: string;
  weight: number;
  distanceKm: number;
  price: number;
  offerType: "eco" | "standard" | "express";
  driverName: string;
  driverVehicle: string;
  driverRating: number;
  deliveredAt?: string;
}

export const MOCK_SHIPMENTS: ShipmentRecord[] = [
  {
    id: "SF-8902",
    route: "Port Autonome de Cotonou → Marché de Gros, Calavi",
    origin: "Port Autonome de Cotonou",
    destination: "Marché de Gros, Calavi",
    date: "Aujourd'hui, 14:32",
    status: "En cours",
    cargoLabel: "Marchandise Générale (Cartons)",
    weight: 12,
    distanceKm: 18,
    price: 107200,
    offerType: "standard",
    driverName: "Koffi BADAROU",
    driverVehicle: "Camion Bâché 15 Tonnes (Volvo FH)",
    driverRating: 4.9,
  },
  {
    id: "SF-8841",
    route: "Cotonou → Calavi",
    origin: "Dépôt Gbegamey, Cotonou",
    destination: "Zone Universitaire, Calavi",
    date: "Hier, 16:12",
    status: "Livré",
    cargoLabel: "Ciment / Matériaux de Construction",
    weight: 8,
    distanceKm: 20,
    price: 98500,
    offerType: "eco",
    driverName: "Ibrahim SALIFOU",
    driverVehicle: "Petit Camion Bâché 3,5t (Hyundai HD72)",
    driverRating: 4.7,
    deliveredAt: "Hier, 17:48",
  },
  {
    id: "SF-8790",
    route: "Akpakpa → Godomey",
    origin: "Zone Industrielle, Akpakpa",
    destination: "Godomey Carrefour",
    date: "09 Oct, 11:05",
    status: "Livré",
    cargoLabel: "Produits Périssables",
    weight: 5,
    distanceKm: 14,
    price: 137200,
    offerType: "express",
    driverName: "Edwige HOUNKPATIN",
    driverVehicle: "Camion Frigorifique 5t (Isuzu NQR)",
    driverRating: 5.0,
    deliveredAt: "09 Oct, 12:20",
  },
];
