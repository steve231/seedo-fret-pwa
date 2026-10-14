import { useNavigate } from "react-router";
import { Route, Repeat2, Clock, ArrowLeft, ArrowRight } from "lucide-react";
import { StepHeader } from "../../components/StepHeader";
import { useShipment } from "../../state/ShipmentContext";

export default function Step2Route() {
  const navigate = useNavigate();
  const { draft, update } = useShipment();

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3">
        <StepHeader icon={Route} title="Itinéraire & option" step={2} total={3} />

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <input type="text" value={draft.origin} onChange={e => update({ origin: e.target.value })}
              placeholder="Lieu de chargement"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-[#FF7A00] outline-none" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF7A00] shrink-0" />
            <input type="text" value={draft.destination} onChange={e => update({ destination: e.target.value })}
              placeholder="Lieu de livraison"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-[#FF7A00] outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Distance estimée (km)</label>
            <input type="number" value={draft.distanceKm} min={1} max={200}
              onChange={e => update({ distanceKm: Number(e.target.value) || 1 })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#FF7A00] outline-none" />
            <p className="text-[10px] text-slate-400 mt-1">Calcul automatique par cartographie à venir — estimation manuelle pour l'instant.</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Repeat2 className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-900">Retour à vide (Backhaul)</p>
              <p className="text-[10px] text-amber-700">Économisez jusqu'à -20% sur ce trajet</p>
            </div>
          </div>
          <input type="checkbox" checked={draft.backhaul} onChange={e => update({ backhaul: e.target.checked })}
            className="w-4 h-4 accent-[#FF7A00] rounded cursor-pointer shrink-0" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3">
        <h2 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-[#FF7A00]" /> Quand ?
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => update({ when: "now" })}
            className={`py-2.5 rounded-xl text-xs font-bold border-2 transition ${draft.when === "now" ? "border-[#FF7A00] bg-orange-50 text-[#FF7A00]" : "border-slate-200 text-slate-500"}`}>
            Maintenant
          </button>
          <button onClick={() => update({ when: "scheduled" })}
            className={`py-2.5 rounded-xl text-xs font-bold border-2 transition ${draft.when === "scheduled" ? "border-[#FF7A00] bg-orange-50 text-[#FF7A00]" : "border-slate-200 text-slate-500"}`}>
            Programmer
          </button>
        </div>
        {draft.when === "scheduled" && (
          <input type="datetime-local" value={draft.scheduledAt} onChange={e => update({ scheduledAt: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-[#FF7A00] outline-none" />
        )}
      </div>

      <div className="flex gap-3">
        <button onClick={() => navigate("/nouvelle-demande")}
          className="shrink-0 bg-white border border-slate-200 text-slate-600 font-bold py-3.5 px-4 rounded-2xl transition flex items-center justify-center">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button onClick={() => navigate("/nouvelle-demande/offres")}
          className="flex-1 bg-[#FF7A00] hover:bg-[#ff8c1a] text-white font-bold py-3.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm">
          Calculer les 3 offres SEEDO <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
