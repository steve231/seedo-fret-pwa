export interface Carrier {
  id: string;
  name: string;
  phone: string;
  city: string;
  vehicleLabel: string;
  rating: number;
  totalTrips: number;
  // Statut de validation des documents par SEEDO (carrier_profiles.documents_status).
  status: "active" | "pending" | "rejected";
}

export const MOCK_CARRIERS: Carrier[] = [
  {
    id: "CR-001",
    name: "Koffi Dossou",
    phone: "+229 97 12 34 56",
    city: "Cotonou",
    vehicleLabel: "Camion Bâché 15 Tonnes (Volvo FH)",
    rating: 4.9,
    totalTrips: 142,
    status: "active",
  },
  {
    id: "CR-002",
    name: "Ahmed Sanni",
    phone: "+229 96 88 20 10",
    city: "Porto-Novo",
    vehicleLabel: "Fourgon 5 Tonnes (Renault)",
    rating: 4.6,
    totalTrips: 58,
    status: "active",
  },
  {
    id: "CR-003",
    name: "Marie Agbo",
    phone: "+229 95 40 77 02",
    city: "Calavi",
    vehicleLabel: "Citerne 10 Tonnes",
    rating: 5.0,
    totalTrips: 12,
    status: "pending",
  },
];
