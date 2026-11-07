import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Zap, Loader2, AlertCircle } from "lucide-react";
import { useShipment, type OfferType, type BackendOffer, type PriceBreakdown } from "../../state/ShipmentContext";
import { formatFcfa } from "../../lib/pricing";

function formatEta(minutes: number): string {
  return minutes < 60 ? `${minutes} min` : `${(minutes / 60).toFixed(1)} h`;
}
import { api, ApiError } from "../../lib/api";

const OFFER_META: Record<OfferType, { badge: string; badgeClass: string; title: string; etaLabelText: string }> = {
  eco: { badge: "Économique", badgeClass: "bg-slate-100 text-slate-700", title: "Regroupement / Trajet Souple", etaLabelText: "Livraison estimée" },
  standard: { badge: "Standard", badgeClass: "bg-orange-100 text-[#FF7A00]", title: "Camion Dédié Direct", etaLabelText: "ETA Estimé" },
  express: { badge: "⚡ Express", badgeClass: "bg-purple-100 text-purple-700", title: "Affectation Prioritaire", etaLabelText: "ETA Rapide" },
};

interface QuoteResponse {
  id: string;
}

interface OffersResponse {
  quote_id: string;
  payment_mode: "immediate" | "deferred";
  payment_terms_days: number;
  breakdown: PriceBreakdown;
  offers: BackendOffer[];
}

export default function Offers() {
  const navigate = useNavigate();
  const { draft, update } = useShipment();
  const [loading, setLoading] = useState(draft.offers === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (draft.offers !== null) return; // déjà calculées (retour en arrière depuis "Recherche")

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const quote = await api.post<QuoteResponse>("/quote", {
          category: draft.category,
          weight_tonnes: draft.weight,
          volume_m3: draft.volume,
          origin_label: draft.origin,
          destination_label: draft.destination,
          distance_km: draft.distanceKm,
          scheduled_at: draft.when === "scheduled" && draft.scheduledAt ? new Date(draft.scheduledAt).toISOString() : null,
          backhaul_requested: draft.backhaul,
        });
        const offersRes = await api.post<OffersResponse>("/offers", { quote_id: quote.id });
        if (cancelled) return;
        update({
          quoteId: quote.id,
          offers: offersRes.offers,
          paymentMode: offersRes.payment_mode,
          paymentTermsDays: offersRes.payment_terms_days,
          breakdown: offersRes.breakdown,
        });
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Calcul des offres impossible. Réessayez.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-xs">Calcul des 3 offres SEEDO…</p>
      </div>
    );
  }

  if (error || !draft.offers || !draft.breakdown) {
    return (
      <div className="space-y-3 text-center py-10">
        <AlertCircle className="h-8 w-8 text-red-400 mx-auto" />
        <p className="text-xs text-red-600">{error ?? "Impossible de calculer les offres."}</p>
        <button onClick={() => navigate("/nouvelle-demande/trajet")}
          className="text-xs font-bold text-[#FF7A00] underline">
          Revenir en arrière
        </button>
      </div>
    );
  }

  const offersByType = Object.fromEntries(draft.offers.map(o => [o.type, o])) as Record<OfferType, BackendOffer>;
  const selected = offersByType[draft.selectedOffer];
  const b = draft.breakdown;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-slate-900 text-sm">SEEDO Smart 3 Offers™</h2>
          <p className="text-[10px] text-slate-500">Sélectionnez l'offre adaptée à votre besoin</p>
        </div>
        <button onClick={() => navigate("/nouvelle-demande/trajet")} className="text-xs text-[#0B2A4A] font-semibold underline">
          Modifier
        </button>
      </div>

      <div className="space-y-3">
        {(["eco", "standard", "express"] as OfferType[]).map(type => {
          const meta = OFFER_META[type];
          const offer = offersByType[type];
          if (!offer) return null;
          const isSelected = draft.selectedOffer === type;
          return (
            <div key={type} onClick={() => update({ selectedOffer: type })}
              className={`bg-white p-3.5 rounded-2xl border-2 cursor-pointer transition relative ${isSelected ? "border-[#FF7A00] shadow-md" : "border-slate-200 hover:border-slate-300"}`}>
              {type === "standard" && (
                <span className="absolute -top-2.5 right-4 bg-[#FF7A00] text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-full shadow">
                  ⭐ RECOMMANDÉE
                </span>
              )}
              <div className="flex justify-between items-start">
                <div>
                  <span className={`${meta.badgeClass} text-[9px] font-bold px-2 py-0.5 rounded-full`}>{meta.badge}</span>
                  <h3 className="font-bold text-slate-900 text-xs mt-1">{meta.title}</h3>
                  <p className="text-[10px] text-slate-500">{meta.etaLabelText} : <span className="font-semibold text-slate-700">{formatEta(offer.eta_minutes)}</span></p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-extrabold ${type === "standard" ? "text-lg text-[#FF7A00]" : "text-base text-slate-900"}`}>
                    {formatFcfa(offer.price_fcfa)}
                  </p>
                  {type === "eco" && <p className="text-[9px] text-emerald-600 font-semibold">Prix le plus bas</p>}
                  {type === "standard" && <p className="text-[9px] text-slate-400">Paiement Séquestre</p>}
                  {type === "express" && <p className="text-[9px] text-purple-600 font-semibold">Affectation prioritaire</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-100 p-3 rounded-xl text-[11px] text-slate-600 space-y-1">
        <div className="flex justify-between"><span>Forfait Prise en charge :</span><span className="font-semibold">{formatFcfa(b.forfait_fcfa)}</span></div>
        <div className="flex justify-between"><span>Distance ({draft.distanceKm} km) :</span><span className="font-semibold">{formatFcfa(b.distance_cost_fcfa)}</span></div>
        <div className="flex justify-between"><span>Tonnage ({draft.weight}t) :</span><span className="font-semibold">{formatFcfa(b.tonnage_cost_fcfa)}</span></div>
        {draft.backhaul && b.backhaul_discount_pct > 0 && (
          <div className="flex justify-between text-amber-700 font-semibold"><span>Remise Backhaul :</span><span>-{b.backhaul_discount_pct}%</span></div>
        )}
        {draft.paymentMode === "deferred" && b.deferred_payment_markup_pct > 0 && (
          <div className="flex justify-between text-slate-500"><span>Majoration paiement différé :</span><span>+{b.deferred_payment_markup_pct}%</span></div>
        )}
        <div className="flex justify-between text-slate-900 font-bold pt-1 border-t border-slate-200">
          <span>Prix Total ({OFFER_META[draft.selectedOffer].badge}) :</span>
          <span>{formatFcfa(selected.price_fcfa)}</span>
        </div>
      </div>

      <button onClick={() => navigate("/nouvelle-demande/recherche")}
        className="w-full bg-[#0B2A4A] hover:bg-[#14325C] text-white font-bold py-3.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm">
        Confirmer & Lancer SEEDO Smart Match™ <Zap className="h-4 w-4" />
      </button>
    </div>
  );
}
