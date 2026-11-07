import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router";
import { ShieldCheck, LifeBuoy, Loader2, AlertCircle } from "lucide-react";
import { api } from "../../lib/api";

const STATUS_LABELS: Record<string, string> = {
  recherche: "Recherche",
  transporteur_trouve: "Transporteur trouvé",
  en_route_chargement: "En route vers chargement",
  chargement: "Chargement",
  en_transit: "En transit",
  arrive: "Arrivé",
  livre: "Livré",
  annule: "Annulé",
};
const STATUSES = ["recherche", "transporteur_trouve", "en_route_chargement", "chargement", "en_transit", "arrive", "livre"];

interface StatusHistoryEntry {
  status: string;
  changed_at: string;
}

interface OrderTracking {
  id: string;
  status: string;
  otp_code: string;
  origin_label: string;
  destination_label: string;
  carrier_name: string | null;
  carrier_rating: number | null;
  carrier_total_trips: number | null;
  vehicle_label: string | null;
  status_history: StatusHistoryEntry[];
}

export default function Tracking() {
  const { id } = useParams();
  const [order, setOrder] = useState<OrderTracking | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Protège contre le double montage de React StrictMode en dev : une
  // erreur tardive du premier appel ne doit pas effacer des données déjà
  // chargées avec succès par le second.
  const hasLoadedOnce = useRef(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const load = () => {
      api.get<OrderTracking>(`/orders/${id}/tracking`)
        .then(o => { if (!cancelled) { setOrder(o); setError(null); hasLoadedOnce.current = true; } })
        .catch(err => { if (!cancelled && !hasLoadedOnce.current) setError(err instanceof Error ? err.message : "Chargement impossible."); });
    };

    load();
    const interval = setInterval(load, 8000); // suit l'avancement du transporteur sans action manuelle
    return () => { cancelled = true; clearInterval(interval); };
  }, [id]);

  if (error) {
    return (
      <div className="text-center py-10 space-y-2">
        <AlertCircle className="h-8 w-8 text-red-400 mx-auto" />
        <p className="text-xs text-red-600">{error}</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const stepIndex = STATUSES.indexOf(order.status);
  const otp = order.otp_code.split("");

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">● Transporteur Confirmé</span>
          <span className="text-xs font-bold text-slate-400">Course #{order.id.slice(0, 8)}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-lg border-2 border-[#FF7A00] shrink-0">
            {(order.carrier_name ?? "?").split(" ").map(n => n[0]).slice(0, 2).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 text-sm">{order.carrier_name ?? "Transporteur en cours d'attribution"}</h3>
            <p className="text-[11px] text-slate-500">{order.vehicle_label ?? "—"}</p>
            {order.carrier_rating !== null && (
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-bold text-amber-500">★ {order.carrier_rating}</span>
                <span className="text-[10px] text-slate-400">• {order.carrier_total_trips} courses livrées</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3">
        <h2 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Statut du Transport</h2>
        <p className="text-[10px] text-slate-400 -mt-2">
          {order.origin_label} → {order.destination_label}
        </p>

        <div className="space-y-3.5 relative pl-4 border-l-2 border-slate-200">
          {STATUSES.map((status, i) => {
            const done = i < stepIndex;
            const active = i === stepIndex;
            return (
              <div key={status} className={`relative ${i > stepIndex ? "opacity-45" : ""}`}>
                <span className={`absolute -left-[21px] top-0 w-2.5 h-2.5 rounded-full ${
                  done ? "bg-emerald-500 ring-4 ring-emerald-100"
                  : active ? "bg-[#FF7A00] ring-4 ring-orange-100 animate-pulse"
                  : "bg-slate-300"
                }`} />
                <p className={`text-xs font-bold ${active ? "text-[#FF7A00]" : "text-slate-900"}`}>{STATUS_LABELS[status]}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-[#0B2A4A] text-white p-4 rounded-2xl shadow-md text-center space-y-2">
        <p className="text-[11px] text-slate-300 flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-[#FF7A00]" /> Code de validation livraison (OTP)
        </p>
        <div className="text-2xl font-black tracking-widest text-[#FF7A00] bg-slate-800/80 py-2 rounded-xl border border-slate-700">
          {otp.join(" ")}
        </div>
        <p className="text-[10px] text-slate-400">Ne communiquez ce code au chauffeur qu'après vérification de la marchandise à destination.</p>
      </div>

      <Link to={`/support?course=${order.id}`}
        className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 bg-white border border-slate-200 rounded-2xl py-3">
        <LifeBuoy className="h-4 w-4" /> Signaler un problème sur cette course
      </Link>
    </div>
  );
}
