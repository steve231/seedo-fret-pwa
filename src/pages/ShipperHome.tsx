import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Truck, ArrowRight, Package, Clock, ShieldCheck, ChevronRight } from "lucide-react";
import { api } from "../lib/api";
import { formatFcfa } from "../lib/pricing";

const ACTIVE_STATUSES = new Set(["recherche", "transporteur_trouve", "en_route_chargement", "chargement", "en_transit", "arrive"]);

interface Order {
  id: string;
  status: string;
  price_final_fcfa: number;
  origin_label: string;
  destination_label: string;
}

export default function ShipperHome() {
  const navigate = useNavigate();
  const [recent, setRecent] = useState<Order[]>([]);

  useEffect(() => {
    api.get<Order[]>("/orders").then(orders => setRecent(orders.slice(0, 3))).catch(() => {});
  }, []);

  const goTo = (o: Order) => navigate(ACTIVE_STATUSES.has(o.status) ? `/course/${o.id}` : `/mes-courses/${o.id}`);

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-[#0B2A4A] to-[#14325C] rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-[#FF7A00]/20 rounded-full blur-2xl" />
        <p className="text-xs font-semibold uppercase tracking-wider text-[#FF7A00] mb-2">SEEDO Fret</p>
        <h2 className="text-xl font-extrabold mb-2 relative" style={{ fontFamily: "Montserrat, sans-serif" }}>
          Vous ne choisissez pas le camion.<br />Vous décrivez ce que vous transportez.
        </h2>
        <p className="text-sm text-slate-300 mb-5 relative max-w-sm">
          SEEDO dimensionne, tarife et trouve le transporteur disponible pour vous.
        </p>
        <button onClick={() => navigate("/nouvelle-demande")}
          className="relative bg-[#FF7A00] hover:bg-[#ff8c1a] text-white font-bold px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm transition-colors">
          <Truck className="h-4 w-4" /> Envoyer du fret <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Package, label: "3 offres par demande" },
          { icon: Clock, label: "Sameday ≤ 8h" },
          { icon: ShieldCheck, label: "Paiement séquestré" },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="bg-white border border-slate-100 rounded-2xl p-3 text-center shadow-sm">
            <Icon className="h-5 w-5 text-[#FF7A00] mx-auto mb-1.5" />
            <p className="text-[11px] font-semibold text-slate-700 leading-tight">{label}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-3">Courses récentes</h3>
        {recent.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-6 text-center">
            <Package className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Aucune course pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map(o => (
              <button key={o.id} onClick={() => goTo(o)}
                className="w-full bg-white border border-slate-100 rounded-2xl p-4 text-left shadow-sm flex items-center gap-3 hover:border-[#FF7A00]/40 transition">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                  <Package className="h-5 w-5 text-[#FF7A00]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{o.origin_label} → {o.destination_label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{formatFcfa(o.price_final_fcfa)}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
