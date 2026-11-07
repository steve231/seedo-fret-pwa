import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Package, ChevronRight, Boxes, Loader2 } from "lucide-react";
import { api } from "../lib/api";
import { formatFcfa } from "../lib/pricing";

interface Order {
  id: string;
  status: string;
  price_final_fcfa: number;
  created_at: string;
  origin_label: string;
  destination_label: string;
}

const ACTIVE_STATUSES = new Set(["recherche", "transporteur_trouve", "en_route_chargement", "chargement", "en_transit", "arrive"]);

function statusLabel(status: string): { label: string; className: string } {
  if (status === "livre") return { label: "Livré", className: "text-emerald-600 bg-emerald-50" };
  if (status === "annule") return { label: "Annulé", className: "text-red-500 bg-red-50" };
  return { label: "En cours", className: "text-[#FF7A00] bg-orange-50" };
}

export default function MyShipments() {
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

  const goTo = (o: Order) => {
    navigate(ACTIVE_STATUSES.has(o.status) ? `/course/${o.id}` : `/mes-courses/${o.id}`);
  };

  return (
    <div className="space-y-4">
      <h2 className="font-bold text-slate-900 text-base" style={{ fontFamily: "Montserrat, sans-serif" }}>Mes Courses</h2>

      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center">
          <Boxes className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Aucune course pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(o => {
            const status = statusLabel(o.status);
            const date = new Date(o.created_at).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
            return (
              <button key={o.id} onClick={() => goTo(o)}
                className="w-full bg-white border border-slate-100 rounded-2xl p-4 text-left shadow-sm flex items-center gap-3 hover:border-[#FF7A00]/40 transition">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                  <Package className="h-5 w-5 text-[#FF7A00]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{o.origin_label} → {o.destination_label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{date} • Course #{o.id.slice(0, 8)} • {formatFcfa(o.price_final_fcfa)}</p>
                  <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${status.className}`}>{status.label}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
