import { useState } from "react";
import { CalendarClock, MapPin, Repeat2, Check } from "lucide-react";

export default function CarrierAvailability() {
  const [slot, setSlot] = useState<"now" | "today" | "scheduled">("now");
  const [position, setPosition] = useState("Port Autonome de Cotonou");
  const [backhaul, setBackhaul] = useState(false);
  const [backhaulDest, setBackhaulDest] = useState("");
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-4">
      <h2 className="font-bold text-slate-900 text-base flex items-center gap-2" style={{ fontFamily: "Montserrat, sans-serif" }}>
        <CalendarClock className="h-5 w-5 text-[#FF7A00]" /> Déclarer ma disponibilité
      </h2>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-2">Créneau</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "now", label: "Maintenant" },
              { id: "today", label: "Aujourd'hui" },
              { id: "scheduled", label: "Programmer" },
            ].map(opt => (
              <button key={opt.id} onClick={() => setSlot(opt.id as typeof slot)}
                className={`py-2.5 rounded-xl text-xs font-bold border-2 transition ${slot === opt.id ? "border-[#FF7A00] bg-orange-50 text-[#FF7A00]" : "border-slate-200 text-slate-500"}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Position actuelle du véhicule</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-emerald-500" />
            <input type="text" value={position} onChange={e => setPosition(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-medium focus:ring-2 focus:ring-[#FF7A00] outline-none" />
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Repeat2 className="h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-900">Trajet retour optimisé</p>
                <p className="text-[10px] text-amber-700">Soyez proposé en priorité sur l'axe retour</p>
              </div>
            </div>
            <input type="checkbox" checked={backhaul} onChange={e => setBackhaul(e.target.checked)}
              className="w-4 h-4 accent-[#FF7A00] rounded cursor-pointer shrink-0" />
          </div>
          {backhaul && (
            <input type="text" value={backhaulDest} onChange={e => setBackhaulDest(e.target.value)}
              placeholder="Destination du retour (ex: Cotonou)"
              className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-[#FF7A00] outline-none" />
          )}
        </div>
      </div>

      <button onClick={() => setSaved(true)}
        className="w-full bg-[#FF7A00] hover:bg-[#ff8c1a] text-white font-bold py-3.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm">
        {saved ? <><Check className="h-4 w-4" /> Disponibilité enregistrée</> : "Enregistrer ma disponibilité"}
      </button>
    </div>
  );
}
