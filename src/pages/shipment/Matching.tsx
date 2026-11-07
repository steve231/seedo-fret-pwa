import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { Truck, AlertCircle } from "lucide-react";
import { useShipment } from "../../state/ShipmentContext";
import { api, ApiError } from "../../lib/api";

const CHECKS = [
  { label: "Vérification conformité charge", result: "OK" },
  { label: "Calcul proximité & ponctualité", result: "En cours" },
  { label: "Optimisation retour à vide", result: "Activé" },
];

interface OrderResponse {
  id: string;
}

export default function Matching() {
  const navigate = useNavigate();
  const { draft, update } = useShipment();
  const [doneCount, setDoneCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setDoneCount(c => Math.min(c + 1, CHECKS.length));
    }, 500);

    if (started.current) return () => clearInterval(stepTimer);
    started.current = true;

    (async () => {
      if (!draft.offers) {
        setError("Aucune offre sélectionnée.");
        return;
      }
      const selectedOffer = draft.offers.find(o => o.type === draft.selectedOffer);
      if (!selectedOffer) {
        setError("Offre introuvable.");
        return;
      }
      try {
        const order = await api.post<OrderResponse>("/orders", { offer_id: selectedOffer.id });
        update({ quoteId: null, offers: null }); // la cotation est consommée, on repart propre
        navigate(`/course/${order.id}`, { replace: true });
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Impossible de trouver un transporteur pour le moment.");
      }
    })();

    return () => clearInterval(stepTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="text-center py-10 space-y-4">
        <AlertCircle className="h-10 w-10 text-red-400 mx-auto" />
        <p className="text-sm text-red-600 max-w-xs mx-auto">{error}</p>
        <button onClick={() => navigate("/nouvelle-demande/offres")}
          className="bg-[#FF7A00] hover:bg-[#ff8c1a] text-white font-bold px-6 py-3 rounded-2xl text-sm">
          Revenir aux offres
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-center py-6">
      <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-[#FF7A00] pulse-ring" />
        <Truck className="text-[#FF7A00] h-10 w-10 animate-bounce" />
      </div>

      <div>
        <h2 className="font-extrabold text-slate-900 text-base" style={{ fontFamily: "Montserrat, sans-serif" }}>
          SEEDO Smart Match™ en cours...
        </h2>
        <p className="text-xs text-slate-500 mt-1">Analyse des camions disponibles autour de la zone de chargement</p>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-left space-y-2 text-xs">
        {CHECKS.map((check, i) => (
          <div key={check.label} className="flex items-center justify-between text-slate-600">
            <span className={i < doneCount ? "" : "opacity-40"}>● {check.label}</span>
            {i < doneCount
              ? <span className="text-emerald-600 font-bold">{check.result}</span>
              : <span className="text-slate-300 font-bold">…</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
