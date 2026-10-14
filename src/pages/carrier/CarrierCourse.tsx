import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { Navigation, PhoneCall, ArrowRight, LifeBuoy } from "lucide-react";
import { CURRENT_MISSION } from "../../data/mockMissions";

const STEPS = ["Transporteur trouvé", "En route vers chargement", "Chargement", "En transit", "Arrivé"];

const STEP_ACTIONS = [
  "Je pars vers le chargement",
  "Je suis arrivé au point de chargement",
  "Marchandise chargée, je démarre",
  "Je suis arrivé à destination",
];

export default function CarrierCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const mission = CURRENT_MISSION;

  const atFinalStep = stepIndex === STEPS.length - 1;

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">● Course en cours</span>
          <span className="text-xs font-bold text-slate-400">#{id}</span>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-slate-500">Expéditeur</p>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-slate-900">{mission.shipperName}</p>
            <a href={`tel:${mission.shipperPhone}`} className="flex items-center gap-1 text-[#FF7A00] text-xs font-semibold">
              <PhoneCall className="h-3.5 w-3.5" /> Appeler
            </a>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3">
        <h2 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Statut du transport</h2>
        <p className="text-[10px] text-slate-400 -mt-2">{mission.origin} → {mission.destination} • {mission.cargoLabel} ({mission.weight}t)</p>

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
                <p className={`text-xs font-bold ${active ? "text-[#FF7A00]" : "text-slate-900"}`}>{status}</p>
              </div>
            );
          })}
        </div>
      </div>

      <button className="w-full bg-white border-2 border-[#0B2A4A] text-[#0B2A4A] font-bold py-3 rounded-2xl flex items-center justify-center gap-2 text-sm">
        <Navigation className="h-4 w-4" /> Ouvrir l'itinéraire
      </button>

      {atFinalStep ? (
        <button onClick={() => navigate(`/transporteur/course/${id}/confirmation`)}
          className="w-full bg-[#0B2A4A] hover:bg-[#14325C] text-white font-bold py-3.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm">
          Confirmer la livraison <ArrowRight className="h-4 w-4" />
        </button>
      ) : (
        <button onClick={() => setStepIndex(i => Math.min(i + 1, STEPS.length - 1))}
          className="w-full bg-[#FF7A00] hover:bg-[#ff8c1a] text-white font-bold py-3.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm">
          {STEP_ACTIONS[stepIndex]} <ArrowRight className="h-4 w-4" />
        </button>
      )}

      <Link to={`/transporteur/support?course=${id}`}
        className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 bg-white border border-slate-200 rounded-2xl py-3">
        <LifeBuoy className="h-4 w-4" /> Signaler un problème sur cette course
      </Link>
    </div>
  );
}
