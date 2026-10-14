import { useMemo } from "react";
import { useParams, Link } from "react-router";
import { ShieldCheck, LifeBuoy } from "lucide-react";
import { useShipment } from "../../state/ShipmentContext";
import { MOCK_SHIPMENTS } from "../../data/mockShipments";

const STATUSES = [
  "Recherche",
  "Transporteur trouvé",
  "En route vers chargement",
  "Chargement",
  "En transit",
  "Arrivé",
  "Livré",
];

// Démo : course fraîchement matchée, le chauffeur vient de partir vers le point de chargement.
// Ces statuts sont mis à jour par le chauffeur à chaque étape (pas de GPS continu — voir note tracking).
const CURRENT_STEP = 2;

export default function Tracking() {
  const { id } = useParams();
  const { draft } = useShipment();
  const record = MOCK_SHIPMENTS.find(s => s.id === id);
  const origin = record?.origin ?? draft.origin;
  const destination = record?.destination ?? draft.destination;
  const otp = useMemo(() => Math.floor(1000 + Math.random() * 9000).toString().split(""), []);

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">● Transporteur Confirmé</span>
          <span className="text-xs font-bold text-slate-400">Course #{id}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-lg border-2 border-[#FF7A00] shrink-0">
            KB
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 text-sm">Koffi BADAROU</h3>
            <p className="text-[11px] text-slate-500">Camion Bâché 15 Tonnes (Volvo FH)</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-bold text-amber-500">★ 4.9</span>
              <span className="text-[10px] text-slate-400">• 142 courses livrées</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3">
        <h2 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Statut du Transport</h2>
        <p className="text-[10px] text-slate-400 -mt-2">
          {origin} → {destination}
        </p>

        <div className="space-y-3.5 relative pl-4 border-l-2 border-slate-200">
          {STATUSES.map((status, i) => {
            const done = i < CURRENT_STEP;
            const active = i === CURRENT_STEP;
            return (
              <div key={status} className={`relative ${i > CURRENT_STEP ? "opacity-45" : ""}`}>
                <span className={`absolute -left-[21px] top-0 w-2.5 h-2.5 rounded-full ${
                  done ? "bg-emerald-500 ring-4 ring-emerald-100"
                  : active ? "bg-[#FF7A00] ring-4 ring-orange-100 animate-pulse"
                  : "bg-slate-300"
                }`} />
                <p className={`text-xs font-bold ${active ? "text-[#FF7A00]" : "text-slate-900"}`}>{status}</p>
                {active && <p className="text-[10px] text-slate-400">Chauffeur en route vers le point de chargement</p>}
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

      <Link to={`/support?course=${id}`}
        className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 bg-white border border-slate-200 rounded-2xl py-3">
        <LifeBuoy className="h-4 w-4" /> Signaler un problème sur cette course
      </Link>
    </div>
  );
}
