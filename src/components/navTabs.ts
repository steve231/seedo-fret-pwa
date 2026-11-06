import type { LucideIcon } from "lucide-react";
import { Truck, Boxes, Wallet, User, ClipboardList, CalendarClock, Users, IdCard, ShieldCheck, FileCheck2 } from "lucide-react";

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

export const ADMIN_TABS: TabConfig[] = [
  { to: "/admin/gestionnaires", label: "Gestionnaires de flotte", icon: ShieldCheck, match: p => p.startsWith("/admin/gestionnaires") },
  { to: "/admin/vehicules", label: "Véhicules", icon: Truck, match: p => p.startsWith("/admin/vehicules") },
  { to: "/admin/documents", label: "Documents transporteurs", icon: FileCheck2, match: p => p.startsWith("/admin/documents") },
];

export const FLEET_TABS: TabConfig[] = [
  { to: "/flotte", label: "Courses", icon: ClipboardList, match: p => p === "/flotte" || p.startsWith("/flotte/courses") },
  { to: "/flotte/transporteurs", label: "Transporteurs", icon: Users, match: p => p.startsWith("/flotte/transporteurs") },
  { to: "/flotte/disponibilite", label: "Disponibilité", icon: CalendarClock, match: p => p.startsWith("/flotte/disponibilite") },
  { to: "/flotte/profil", label: "Profil", icon: IdCard, match: p => p.startsWith("/flotte/profil") },
];
