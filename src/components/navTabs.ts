import type { LucideIcon } from "lucide-react";
import { Truck, Boxes, Wallet, User, ClipboardList, CalendarClock, History, IdCard } from "lucide-react";

export interface TabConfig {
  to: string;
  label: string;
  icon: LucideIcon;
  match: (pathname: string) => boolean;
}

export const SHIPPER_TABS: TabConfig[] = [
  { to: "/", label: "Expédier", icon: Truck, match: p => p === "/" || p.startsWith("/nouvelle-demande") || p.startsWith("/course/") },
  { to: "/mes-courses", label: "Mes Courses", icon: Boxes, match: p => p.startsWith("/mes-courses") },
  { to: "/tarifs", label: "Tarifs", icon: Wallet, match: p => p.startsWith("/tarifs") },
  { to: "/compte", label: "Compte", icon: User, match: p => p.startsWith("/compte") },
];

export const CARRIER_TABS: TabConfig[] = [
  { to: "/transporteur", label: "Missions", icon: ClipboardList, match: p => p === "/transporteur" || p.startsWith("/transporteur/mission") || p.startsWith("/transporteur/course") },
  { to: "/transporteur/disponibilite", label: "Disponibilité", icon: CalendarClock, match: p => p.startsWith("/transporteur/disponibilite") },
  { to: "/transporteur/historique", label: "Historique", icon: History, match: p => p.startsWith("/transporteur/historique") },
  { to: "/transporteur/profil", label: "Profil", icon: IdCard, match: p => p.startsWith("/transporteur/profil") },
];
