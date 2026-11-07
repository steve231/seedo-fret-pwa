import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { Navigation, PhoneCall, MessageCircle, ArrowRight, LifeBuoy, Loader2, AlertCircle } from "lucide-react";
import { api, ApiError } from "../../lib/api";

const STEPS = ["transporteur_trouve", "en_route_chargement", "chargement", "en_transit", "arrive"];
const STEP_LABELS: Record<string, string> = {
  transporteur_trouve: "Transporteur trouvé",
  en_route_chargement: "En route vers chargement",
  chargement: "Chargement",
  en_transit: "En transit",
  arrive: "Arrivé",
};
const STEP_ACTIONS = [
  "Le transporteur part vers le chargement",
  "Arrivé au point de chargement",
  "Marchandise chargée, départ",
  "Arrivé à destination",
];

interface OrderTracking {
  id: string;
  status: string;
  origin_label: string;
  destination_label: string;
  shipper_name: string | null;
  shipper_phone: string | null;
  carrier_name: string | null;
  carrier_phone: string | null;
}

export default function FleetCourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderTracking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [advancing, setAdvancing] = useState(false);
  // En dev, React StrictMode monte l'effet deux fois ; si le premier appel
  // (parti avant que le token Firebase soit prêt) échoue APRÈS que le
  // second a réussi, son erreur tardive ne doit pas effacer les données
  // déjà chargées avec succès.
  const hasLoadedOnce = useRef(false);

  const load = () => {
    if (!id) return Promise.resolve();
    return api.get<OrderTracking>(`/orders/${id}/tracking`)
      .then(o => { setOrder(o); setError(null); hasLoadedOnce.current = true; })
      .catch(err => { if (!hasLoadedOnce.current) setError(err instanceof Error ? err.message : "Chargement impossible."); });
  };

  useEffect(() => { load(); }, [id]);

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const stepIndex = STEPS.indexOf(order.status);
  const atFinalStep = stepIndex === STEPS.length - 1;
  const whatsappNumber = (order.carrier_phone ?? "").replace(/[^0-9+]/g, "");

  const advance = async () => {
    if (stepIndex < 0 || stepIndex === STEPS.length - 1) return;
    setAdvancing(true);
    try {
      await api.patch(`/orders/${id}/status`, { status: STEPS[stepIndex + 1] });
      await load(); // garde le bouton désactivé (via `advancing`) tant que le nouveau statut n'est pas reflété
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de faire avancer le statut.");
    } finally {
      setAdvancing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">● Course en cours</span>
          <span className="text-xs font-bold text-slate-400">#{id?.slice(0, 8)}</span>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs text-slate-500">Transporteur assigné</p>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-slate-900">{order.carrier_name ?? "—"}</p>
            {order.carrier_phone && (
              <div className="flex items-center gap-3">
                <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                </a>
                <a href={`tel:${order.carrier_phone}`} className="flex items-center gap-1 text-[#FF7A00] text-xs font-semibold">
                  <PhoneCall className="h-3.5 w-3.5" /> Appeler
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">Expéditeur</p>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-slate-900">{order.shipper_name ?? "—"}</p>
            {order.shipper_phone && (
              <a href={`tel:${order.shipper_phone}`} className="flex items-center gap-1 text-[#FF7A00] text-xs font-semibold">
                <PhoneCall className="h-3.5 w-3.5" /> Appeler
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3">
        <h2 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Statut du transport</h2>
        <p className="text-[10px] text-slate-400 -mt-2">{order.origin_label} → {order.destination_label}</p>

        <div className="space-y-3.5 relative pl-4 border-l-2 border-slate-200">
          {STEPS.map((status, i) => {
            const done = i < stepIndex;
            const active = i === stepIndex;
            return (
              <div key={status} className={`relative ${i > stepIndex ? "opacity-45" : ""}`}>
                <span className={`absolute -left-[21px] top-0 w-2.5 h-2.5 rounded-full ${
                  done ? "bg-emerald-500 ring-4 ring-emerald-100"
                  : active ? "bg-[#FF7A00] ring-4 ring-orange-100 animate-pulse"
                  : "bg-slate-300"
                }`} />
                <p className={`text-xs font-bold ${active ? "text-[#FF7A00]" : "text-slate-900"}`}>{STEP_LABELS[status]}</p>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-100">
          Faites avancer le statut d'après les retours du transporteur par téléphone ou WhatsApp.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <button className="w-full bg-white border-2 border-[#0B2A4A] text-[#0B2A4A] font-bold py-3 rounded-2xl flex items-center justify-center gap-2 text-sm">
        <Navigation className="h-4 w-4" /> Ouvrir l'itinéraire
      </button>

      {atFinalStep ? (
        <button onClick={() => navigate(`/flotte/courses/${id}/confirmation`)}
          className="w-full bg-[#0B2A4A] hover:bg-[#14325C] text-white font-bold py-3.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm">
          Confirmer la livraison <ArrowRight className="h-4 w-4" />
        </button>
      ) : (
        <button onClick={advance} disabled={advancing || stepIndex < 0}
          className="w-full bg-[#FF7A00] hover:bg-[#ff8c1a] disabled:opacity-60 text-white font-bold py-3.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm">
          {advancing ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{STEP_ACTIONS[stepIndex] ?? "Avancer"} <ArrowRight className="h-4 w-4" /></>}
        </button>
      )}

      <Link to={`/flotte/support?course=${id}`}
        className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 bg-white border border-slate-200 rounded-2xl py-3">
        <LifeBuoy className="h-4 w-4" /> Signaler un problème sur cette course
      </Link>
    </div>
  );
}
