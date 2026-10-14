import { useNavigate } from "react-router";
import { Zap } from "lucide-react";
import { useShipment, type OfferType } from "../../state/ShipmentContext";
import { computeQuote, etaLabel, formatFcfa, PRICING } from "../../lib/pricing";

const OFFER_META: Record<OfferType, { badge: string; badgeClass: string; title: string; etaFactor: number; etaLabelText: string }> = {
  eco: { badge: "Économique", badgeClass: "bg-slate-100 text-slate-700", title: "Regroupement / Trajet Souple", etaFactor: 1.6, etaLabelText: "Livraison estimée" },
  standard: { badge: "Standard", badgeClass: "bg-orange-100 text-[#FF7A00]", title: "Camion Dédié Direct", etaFactor: 1, etaLabelText: "ETA Estimé" },
  express: { badge: "⚡ Express", badgeClass: "bg-purple-100 text-purple-700", title: "Affectation Prioritaire", etaFactor: 0.5, etaLabelText: "ETA Rapide" },
};

export default function Offers() {
  const navigate = useNavigate();
  const { draft, update } = useShipment();
  const quote = computeQuote(draft.weight, draft.distanceKm, draft.backhaul);

  const distanceCost = draft.distanceKm * PRICING.coutKm;
  const tonnageCost = draft.weight * PRICING.coutTonne;
  const subtotal = PRICING.forfait + distanceCost + tonnageCost;

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
          const selected = draft.selectedOffer === type;
          return (
            <div key={type} onClick={() => update({ selectedOffer: type })}
              className={`bg-white p-3.5 rounded-2xl border-2 cursor-pointer transition relative ${selected ? "border-[#FF7A00] shadow-md" : "border-slate-200 hover:border-slate-300"}`}>
              {type === "standard" && (
                <span className="absolute -top-2.5 right-4 bg-[#FF7A00] text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-full shadow">
                  ⭐ RECOMMANDÉE
                </span>
              )}
              <div className="flex justify-between items-start">
                <div>
                  <span className={`${meta.badgeClass} text-[9px] font-bold px-2 py-0.5 rounded-full`}>{meta.badge}</span>
                  <h3 className="font-bold text-slate-900 text-xs mt-1">{meta.title}</h3>
                  <p className="text-[10px] text-slate-500">{meta.etaLabelText} : <span className="font-semibold text-slate-700">{etaLabel(draft.distanceKm, meta.etaFactor)}</span></p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-extrabold ${type === "standard" ? "text-lg text-[#FF7A00]" : "text-base text-slate-900"}`}>
                    {formatFcfa(quote[type])}
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
        <div className="flex justify-between"><span>Forfait Prise en charge :</span><span className="font-semibold">{formatFcfa(PRICING.forfait)}</span></div>
        <div className="flex justify-between"><span>Distance ({draft.distanceKm} km × {PRICING.coutKm} FCFA) :</span><span className="font-semibold">{formatFcfa(distanceCost)}</span></div>
        <div className="flex justify-between"><span>Tonnage ({draft.weight}t × {PRICING.coutTonne.toLocaleString("fr-FR")} FCFA) :</span><span className="font-semibold">{formatFcfa(tonnageCost)}</span></div>
        {draft.backhaul && <div className="flex justify-between text-amber-700 font-semibold"><span>Remise Backhaul :</span><span>-20%</span></div>}
        <div className="flex justify-between text-slate-900 font-bold pt-1 border-t border-slate-200">
          <span>Prix Total ({OFFER_META[draft.selectedOffer].badge}) :</span>
          <span>{formatFcfa(quote[draft.selectedOffer])}</span>
        </div>
        {!draft.backhaul && <p className="text-[10px] text-slate-400 pt-0.5">Avant remise : {formatFcfa(subtotal)}</p>}
      </div>

      <button onClick={() => navigate("/nouvelle-demande/recherche")}
        className="w-full bg-[#0B2A4A] hover:bg-[#14325C] text-white font-bold py-3.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm">
        Confirmer & Lancer SEEDO Smart Match™ <Zap className="h-4 w-4" />
      </button>
    </div>
  );
}
