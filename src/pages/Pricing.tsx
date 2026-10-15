import { useState } from "react";
import { Wallet, Info } from "lucide-react";
import { computeQuote, formatFcfa, PRICING } from "../lib/pricing";

export default function Pricing() {
  const [weight, setWeight] = useState(12);
  const [distance, setDistance] = useState(18);
  const [backhaul, setBackhaul] = useState(true);

  const quote = computeQuote(weight, distance, backhaul);

  return (
    <div className="space-y-4">
      <h2 className="font-bold text-slate-900 text-base flex items-center gap-2" style={{ fontFamily: "Montserrat, sans-serif" }}>
        <Wallet className="h-5 w-5 text-[#FF7A00]" /> Simulateur de Tarifs
      </h2>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-5">
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-slate-600">Poids (tonnes)</label>
            <span className="text-sm font-extrabold text-[#0B2A4A]">{weight} t</span>
          </div>
          <input type="range" min={0.5} max={40} step={0.5} value={weight} onChange={e => setWeight(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#FF7A00]" />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-slate-600">Distance (km)</label>
            <span className="text-sm font-extrabold text-[#0B2A4A]">{distance} km</span>
          </div>
          <input type="range" min={1} max={100} step={1} value={distance} onChange={e => setDistance(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#FF7A00]" />
        </div>
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
          <input type="checkbox" checked={backhaul} onChange={e => setBackhaul(e.target.checked)} className="w-4 h-4 accent-[#FF7A00]" />
          Trajet retour optimisé (backhaul) — remise -20%
        </label>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {(["eco", "standard", "express"] as const).map(type => (
          <div key={type} className={`rounded-2xl p-3 text-center border-2 ${type === "standard" ? "border-[#FF7A00] bg-orange-50" : "border-slate-100 bg-white"}`}>
            <p className="text-[10px] font-bold uppercase text-slate-500">{type === "eco" ? "Économique" : type === "standard" ? "Standard" : "Express"}</p>
            <p className={`text-sm font-extrabold mt-1 ${type === "standard" ? "text-[#FF7A00]" : "text-slate-900"}`}>{formatFcfa(quote[type])}</p>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-2 text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-3">
        <Info className="h-4 w-4 text-[#FF7A00] shrink-0 mt-0.5" />
        Estimation basée sur le forfait de référence ({formatFcfa(PRICING.forfait)} + {PRICING.coutKm} FCFA/km + {PRICING.coutTonne.toLocaleString("fr-FR")} FCFA/t). Les tarifs réels restent administrables en back-office.
      </div>
    </div>
  );
}
