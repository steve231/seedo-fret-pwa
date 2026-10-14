import { useNavigate } from "react-router";
import { useState } from "react";
import { MapPin, ChevronRight, TrendingUp, Package } from "lucide-react";
import { MOCK_MISSIONS } from "../../data/mockMissions";
import { formatFcfa } from "../../lib/pricing";

export default function CarrierHome() {
  const navigate = useNavigate();
  const [online, setOnline] = useState(true);

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-[#0B2A4A] to-[#14325C] rounded-3xl p-5 text-white relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-[#FF7A00]/20 rounded-full blur-2xl" />
        <div className="flex items-center justify-between relative">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#FF7A00] mb-1">Statut</p>
            <h2 className="text-lg font-extrabold" style={{ fontFamily: "Montserrat, sans-serif" }}>
              {online ? "Vous êtes en ligne" : "Vous êtes hors ligne"}
            </h2>
            <p className="text-xs text-slate-300 mt-1">{online ? "Vous recevez les missions compatibles" : "Activez-vous pour recevoir des missions"}</p>
          </div>
          <button onClick={() => setOnline(o => !o)}
            className={`relative w-14 h-8 rounded-full transition-colors shrink-0 ${online ? "bg-emerald-500" : "bg-slate-600"}`}>
            <span className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${online ? "translate-x-7" : "translate-x-1"}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
          <TrendingUp className="h-5 w-5 text-[#FF7A00] mb-1.5" />
          <p className="text-lg font-extrabold text-slate-900" style={{ fontFamily: "Montserrat, sans-serif" }}>{formatFcfa(107200)}</p>
          <p className="text-[11px] text-slate-500">Revenus aujourd'hui</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
          <Package className="h-5 w-5 text-[#FF7A00] mb-1.5" />
          <p className="text-lg font-extrabold text-slate-900" style={{ fontFamily: "Montserrat, sans-serif" }}>142</p>
          <p className="text-[11px] text-slate-500">Courses livrées</p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-3">Missions compatibles</h3>
        <div className="space-y-3">
          {MOCK_MISSIONS.map(m => (
            <button key={m.id} onClick={() => navigate(`/transporteur/mission/${m.id}`)}
              className="w-full bg-white border border-slate-100 rounded-2xl p-4 text-left shadow-sm hover:border-[#FF7A00]/40 transition">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1">
                    <MapPin className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">{m.origin}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-2">
                    <MapPin className="h-3.5 w-3.5 text-[#FF7A00] shrink-0" />
                    <span className="truncate">{m.destination}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">{m.cargoLabel} • {m.weight}t</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{m.pickupWindow}{m.backhaul && " • Backhaul"}</p>
                </div>
                <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                  <p className="text-sm font-extrabold text-[#FF7A00]">{formatFcfa(m.price)}</p>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
