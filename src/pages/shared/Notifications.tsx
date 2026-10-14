import { Truck, Package, ShieldCheck, Wallet, Bell } from "lucide-react";

const NOTIFICATIONS = [
  { icon: Truck, color: "text-[#FF7A00] bg-orange-50", title: "Chauffeur en route vers le chargement", desc: "Course #SF-8902 — Koffi BADAROU", time: "Il y a 5 min", unread: true },
  { icon: Package, color: "text-blue-600 bg-blue-50", title: "Nouvelle mission compatible", desc: "Zone Industrielle, Akpakpa → Godomey Carrefour", time: "Il y a 32 min", unread: true },
  { icon: ShieldCheck, color: "text-emerald-600 bg-emerald-50", title: "Livraison confirmée", desc: "Course #SF-8841 clôturée avec succès", time: "Hier, 16:14", unread: false },
  { icon: Wallet, color: "text-[#0B2A4A] bg-slate-100", title: "Paiement débloqué", desc: "98 500 FCFA crédités pour la course #SF-8841", time: "Hier, 16:15", unread: false },
];

export default function Notifications() {
  return (
    <div className="space-y-4">
      <h2 className="font-bold text-slate-900 text-base flex items-center gap-2" style={{ fontFamily: "Montserrat, sans-serif" }}>
        <Bell className="h-5 w-5 text-[#FF7A00]" /> Notifications
      </h2>

      <div className="space-y-2">
        {NOTIFICATIONS.map((n, i) => {
          const Icon = n.icon;
          return (
            <div key={i} className={`bg-white border rounded-2xl p-3.5 flex items-start gap-3 shadow-sm ${n.unread ? "border-[#FF7A00]/30" : "border-slate-100"}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${n.color}`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900">{n.title}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{n.desc}</p>
                <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
              </div>
              {n.unread && <span className="w-2 h-2 rounded-full bg-[#FF7A00] shrink-0 mt-1" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
