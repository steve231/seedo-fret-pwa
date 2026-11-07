import { useEffect, useMemo, useRef, useState } from "react";
import { Package, Star, TrendingUp, Loader2 } from "lucide-react";
import { api } from "../../lib/api";
import { formatFcfa } from "../../lib/pricing";

interface Order {
  id: string;
  created_at: string;
  price_final_fcfa: number;
  origin_label: string;
  destination_label: string;
  carrier_id: string | null;
  carrier_name: string | null;
  carrier_rating: number | null;
}

interface Carrier {
  id: string;
  full_name: string;
}

export default function FleetHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [carrierId, setCarrierId] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedOnce = useRef(false);

  useEffect(() => {
    Promise.all([
      api.get<Order[]>("/orders?status=livre"),
      api.get<Carrier[]>("/carriers"),
    ])
      .then(([o, c]) => { setOrders(o); setCarriers(c); hasLoadedOnce.current = true; })
      .catch(err => { if (!hasLoadedOnce.current) setError(err instanceof Error ? err.message : "Chargement impossible."); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => carrierId === "all" ? orders : orders.filter(o => o.carrier_id === carrierId),
    [orders, carrierId],
  );
  const total = filtered.reduce((sum, o) => sum + o.price_final_fcfa, 0);
  const ratings = filtered.map(o => o.carrier_rating).filter((r): r is number => r !== null);
  const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : "—";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</div>
      )}

      <div className="flex items-center justify-between gap-3">
        <h2 className="font-bold text-slate-900 text-base" style={{ fontFamily: "Montserrat, sans-serif" }}>Historique & Performance</h2>
        <select value={carrierId} onChange={e => setCarrierId(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-600 focus:ring-2 focus:ring-[#FF7A00] outline-none">
          <option value="all">Toute la flotte</option>
          {carriers.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-slate-100 rounded-2xl p-3 text-center shadow-sm">
          <p className="text-base font-extrabold text-slate-900">{filtered.length}</p>
          <p className="text-[10px] text-slate-500">Courses livrées</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-3 text-center shadow-sm">
          <p className="text-base font-extrabold text-amber-500 flex items-center justify-center gap-0.5"><Star className="h-3.5 w-3.5 fill-amber-500" />{avgRating}</p>
          <p className="text-[10px] text-slate-500">Note moyenne</p>
        </div>
      </div>

      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-3 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-[#FF7A00] shrink-0" />
        <p className="text-xs text-orange-900"><span className="font-bold">{formatFcfa(total)}</span> gagnés sur les courses affichées</p>
      </div>

      {filtered.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-10">Aucune course livrée pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map(o => {
            const date = new Date(o.created_at).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
            return (
              <div key={o.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <Package className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900">{o.origin_label} → {o.destination_label}</p>
                  <p className="text-[10px] text-slate-400">{date} • #{o.id.slice(0, 8)} • {o.carrier_name}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-extrabold text-slate-900">{formatFcfa(o.price_final_fcfa)}</p>
                  {o.carrier_rating !== null && (
                    <p className="text-[10px] text-amber-500 flex items-center justify-end gap-0.5"><Star className="h-3 w-3 fill-amber-500" />{o.carrier_rating}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
