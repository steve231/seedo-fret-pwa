import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { MapPin, ChevronRight, TrendingUp, Package, User, Loader2 } from "lucide-react";
import { api } from "../../lib/api";
import { formatFcfa } from "../../lib/pricing";

const ACTIVE_STATUSES = new Set(["recherche", "transporteur_trouve", "en_route_chargement", "chargement", "en_transit", "arrive"]);

interface Order {
  id: string;
  status: string;
  price_final_fcfa: number;
  created_at: string;
  origin_label: string;
  destination_label: string;
  category: string;
  weight_tonnes: number;
  carrier_name: string | null;
}

export default function FleetHome() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedOnce = useRef(false);

  useEffect(() => {
    api.get<Order[]>("/orders")
      .then(o => { setOrders(o); hasLoadedOnce.current = true; })
      .catch(err => { if (!hasLoadedOnce.current) setError(err instanceof Error ? err.message : "Chargement impossible."); })
      .finally(() => setLoading(false));
  }, []);

  const active = orders.filter(o => ACTIVE_STATUSES.has(o.status));
  const delivered = orders.filter(o => o.status === "livre");
  const today = new Date().toDateString();
  const revenueToday = delivered
    .filter(o => new Date(o.created_at).toDateString() === today)
    .reduce((sum, o) => sum + o.price_final_fcfa, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</div>
      )}

      <div className="bg-gradient-to-br from-[#0B2A4A] to-[#14325C] rounded-3xl p-5 text-white relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-[#FF7A00]/20 rounded-full blur-2xl" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#FF7A00] mb-1">Votre flotte</p>
          <h2 className="text-lg font-extrabold" style={{ fontFamily: "Montserrat, sans-serif" }}>
            {active.length} course{active.length !== 1 ? "s" : ""} en cours
          </h2>
          <p className="text-xs text-slate-300 mt-1">Réparties sur vos transporteurs actifs</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
          <TrendingUp className="h-5 w-5 text-[#FF7A00] mb-1.5" />
          <p className="text-lg font-extrabold text-slate-900" style={{ fontFamily: "Montserrat, sans-serif" }}>{formatFcfa(revenueToday)}</p>
          <p className="text-[11px] text-slate-500">Revenus flotte aujourd'hui</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
          <Package className="h-5 w-5 text-[#FF7A00] mb-1.5" />
          <p className="text-lg font-extrabold text-slate-900" style={{ fontFamily: "Montserrat, sans-serif" }}>{delivered.length}</p>
          <p className="text-[11px] text-slate-500">Courses livrées (flotte)</p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-3">Courses en cours</h3>
        {active.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-10">Aucune course en cours pour le moment.</p>
        ) : (
          <div className="space-y-3">
            {active.map(o => (
              <button key={o.id} onClick={() => navigate(`/flotte/courses/${o.id}`)}
                className="w-full bg-white border border-slate-100 rounded-2xl p-4 text-left shadow-sm hover:border-[#FF7A00]/40 transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 mb-2">
                      <User className="h-3.5 w-3.5 text-[#0B2A4A] shrink-0" />
                      <span className="truncate">{o.carrier_name ?? "—"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1">
                      <MapPin className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{o.origin_label}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-2">
                      <MapPin className="h-3.5 w-3.5 text-[#FF7A00] shrink-0" />
                      <span className="truncate">{o.destination_label}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800">{o.category} • {o.weight_tonnes}t</p>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                    <p className="text-sm font-extrabold text-[#FF7A00]">{formatFcfa(o.price_final_fcfa)}</p>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
