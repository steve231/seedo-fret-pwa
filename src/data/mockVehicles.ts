export interface Vehicle {
  id: string;
  carrierId: string;
  carrierName: string;
  gabarit: "leger" | "moyen" | "lourd";
  carrosserie: string;
  capacityWeightKg: number;
  licensePlate: string;
  label: string;
  status: "active" | "pending" | "suspended";
}

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: "VH-001",
    carrierId: "CR-001",
    carrierName: "Koffi Dossou",
    gabarit: "lourd",
    carrosserie: "bache",
    capacityWeightKg: 15000,
    licensePlate: "AB 1234 RB",
    label: "Camion Bâché 15 Tonnes (Volvo FH)",
    status: "active",
  },
  {
    id: "VH-002",
    carrierId: "CR-002",
    carrierName: "Ahmed Sanni",
    gabarit: "moyen",
    carrosserie: "fourgon",
    capacityWeightKg: 5000,
    licensePlate: "RB 5521 AB",
    label: "Fourgon 5 Tonnes (Renault)",
    status: "active",
  },
  {
    id: "VH-003",
    carrierId: "CR-003",
    carrierName: "Marie Agbo",
    gabarit: "moyen",
    carrosserie: "citerne",
    capacityWeightKg: 10000,
    licensePlate: "PN 8890 CL",
    label: "Citerne 10 Tonnes",
    status: "pending",
  },
];
