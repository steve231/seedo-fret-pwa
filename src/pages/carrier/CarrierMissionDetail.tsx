import { useNavigate, useParams } from "react-router";
import { MapPin, Package, Scale, Clock, Repeat2, X, Check } from "lucide-react";
import { MOCK_MISSIONS } from "../../data/mockMissions";
import { formatFcfa } from "../../lib/pricing";

export default function CarrierMissionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const mission = MOCK_MISSIONS.find(m => m.id === id);

  if (!mission) {
    return <p className="text-sm text-slate-500">Mission introuvable.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex items-center justify-between">
          <span className="bg-orange-100 text-[#FF7A00] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
            Offre {mission.offerType === "standard" ? "Standard" : mission.offerType === "express" ? "Express" : "Économique"}
          </span>
          <span className="text-xs font-bold text-slate-400">#{mission.id}</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <p className="text-sm font-semibold text-slate-800">{mission.origin}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF7A00] shrink-0" />
            <p className="text-sm font-semibold text-slate-800">{mission.destination}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Package className="h-4 w-4 text-[#FF7A00] shrink-0" /> {mission.cargoLabel}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Scale className="h-4 w-4 text-[#FF7A00] shrink-0" /> {mission.weight} tonnes
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <MapPin className="h-4 w-4 text-[#FF7A00] shrink-0" /> {mission.distanceKm} km
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Clock className="h-4 w-4 text-[#FF7A00] shrink-0" /> {mission.pickupWindow}
          </div>
        </div>

        {mission.backhaul && (
          <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl flex items-center gap-2 text-xs text-amber-800 font-semibold">
            <Repeat2 className="h-4 w-4 shrink-0" /> Compatible avec un trajet retour optimisé
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Vous percevez</span>
          <span className="text-xl font-extrabold text-[#FF7A00]" style={{ fontFamily: "Montserrat, sans-serif" }}>
            {formatFcfa(mission.price)}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => navigate("/transporteur")}
          className="flex-1 bg-white border-2 border-slate-200 text-slate-600 font-bold py-3.5 rounded-2xl transition flex items-center justify-center gap-2 text-sm">
          <X className="h-4 w-4" /> Refuser
        </button>
        <button onClick={() => navigate(`/transporteur/course/${mission.id}`)}
          className="flex-1 bg-[#0B2A4A] hover:bg-[#14325C] text-white font-bold py-3.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm">
          <Check className="h-4 w-4" /> Accepter
        </button>
      </div>
    </div>
  );
}
