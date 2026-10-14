import { useNavigate } from "react-router";
import { Package2, Truck, ArrowRight } from "lucide-react";
import { StepHeader } from "../../components/StepHeader";
import { useShipment } from "../../state/ShipmentContext";
import { CATEGORIES, dimensionVehicle, vehicleCount } from "../../lib/pricing";

export default function Step1Cargo() {
  const navigate = useNavigate();
  const { draft, update } = useShipment();

  const { type, capacity } = dimensionVehicle(draft.weight);
  const count = vehicleCount(draft.weight, capacity);

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <StepHeader icon={Package2} title="Que voulez-vous transporter ?" step={1} total={3} />

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Marchandise / Catégorie</label>
            <select value={draft.category} onChange={e => update({ category: e.target.value as typeof draft.category })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:ring-2 focus:ring-[#FF7A00] outline-none">
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Poids (Tonnes)</label>
              <input type="number" value={draft.weight} min={0.5} max={40} step={0.5}
                onChange={e => update({ weight: Number(e.target.value) || 0.5 })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#FF7A00] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Volume Est. (m³)</label>
              <input type="number" value={draft.volume} min={1} max={100}
                onChange={e => update({ volume: Number(e.target.value) || 1 })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#FF7A00] outline-none" />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-2.5 rounded-xl flex items-center justify-between text-xs text-blue-900">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-600 shrink-0" />
              <div>
                <p className="font-bold text-[11px]">{type}</p>
                <p className="text-[10px] text-blue-700">Dimensionnement : {count} véhicule{count > 1 ? "s" : ""} requis</p>
              </div>
            </div>
            <span className="bg-blue-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-full shrink-0">Auto</span>
          </div>
        </div>
      </div>

      <button onClick={() => navigate("/nouvelle-demande/trajet")}
        className="w-full bg-[#FF7A00] hover:bg-[#ff8c1a] text-white font-bold py-3.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm">
        Suivant : Itinéraire & option <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
