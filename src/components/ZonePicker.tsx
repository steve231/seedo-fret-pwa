import { useEffect, useState } from "react";
import { X, Globe2, Route } from "lucide-react";
import { getCountries, getHubs, type Country, type Hub } from "../lib/zones";

export interface ZoneEntry {
  zone_type: "country" | "corridor";
  country_code?: string | null;
  origin_hub_id?: string | null;
  destination_hub_id?: string | null;
}

interface ZonePickerProps {
  value: ZoneEntry[];
  onChange: (zones: ZoneEntry[]) => void;
}

/**
 * Zone(s) d'action d'un transporteur — par pays (cases à cocher) ou par
 * corridor précis entre deux villes-hubs (deux listes déroulantes).
 * Toujours des listes, jamais de saisie libre : une faute de frappe sur
 * un nom de ville casserait silencieusement le matching.
 */
export function ZonePicker({ value, onChange }: ZonePickerProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [mode, setMode] = useState<"country" | "corridor">("country");
  const [originHub, setOriginHub] = useState("");
  const [destHub, setDestHub] = useState("");

  useEffect(() => {
    getCountries().then(setCountries).catch(() => {});
    getHubs().then(setHubs).catch(() => {});
  }, []);

  const countryLabel = (code?: string | null) => countries.find(c => c.code === code)?.name ?? code ?? "?";
  const hubLabel = (id?: string | null) => hubs.find(h => h.id === id)?.name ?? "?";

  const toggleCountry = (code: string) => {
    const exists = value.some(z => z.zone_type === "country" && z.country_code === code);
    if (exists) onChange(value.filter(z => !(z.zone_type === "country" && z.country_code === code)));
    else onChange([...value, { zone_type: "country", country_code: code }]);
  };

  const addCorridor = () => {
    if (!originHub || !destHub || originHub === destHub) return;
    onChange([...value, { zone_type: "corridor", origin_hub_id: originHub, destination_hub_id: destHub }]);
    setOriginHub("");
    setDestHub("");
  };

  const removeZone = (index: number) => onChange(value.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => setMode("country")}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold border-2 transition ${mode === "country" ? "border-[#FF7A00] bg-orange-50 text-[#FF7A00]" : "border-slate-200 text-slate-500"}`}>
          <Globe2 className="h-3.5 w-3.5" /> Par pays
        </button>
        <button type="button" onClick={() => setMode("corridor")}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold border-2 transition ${mode === "corridor" ? "border-[#FF7A00] bg-orange-50 text-[#FF7A00]" : "border-slate-200 text-slate-500"}`}>
          <Route className="h-3.5 w-3.5" /> Par corridor
        </button>
      </div>

      {mode === "country" ? (
        <div className="grid grid-cols-2 gap-1.5">
          {countries.map(c => {
            const checked = value.some(z => z.zone_type === "country" && z.country_code === c.code);
            return (
              <label key={c.code} className="flex items-center gap-2 text-xs font-medium text-slate-700 px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                <input type="checkbox" checked={checked} onChange={() => toggleCountry(c.code)}
                  className="w-3.5 h-3.5 accent-[#FF7A00] rounded cursor-pointer shrink-0" />
                {c.name}
              </label>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-[10px] text-slate-500">Un corridor couvre les deux sens du trajet.</p>
          <div className="flex items-center gap-2">
            <select value={originHub} onChange={e => setOriginHub(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-medium focus:ring-2 focus:ring-[#FF7A00] outline-none">
              <option value="">Ville de départ</option>
              {hubs.map(h => <option key={h.id} value={h.id}>{h.name} ({countryLabel(h.country_code)})</option>)}
            </select>
            <span className="text-slate-400 text-xs shrink-0">↔</span>
            <select value={destHub} onChange={e => setDestHub(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-medium focus:ring-2 focus:ring-[#FF7A00] outline-none">
              <option value="">Ville d'arrivée</option>
              {hubs.map(h => <option key={h.id} value={h.id}>{h.name} ({countryLabel(h.country_code)})</option>)}
            </select>
          </div>
          <button type="button" onClick={addCorridor} disabled={!originHub || !destHub || originHub === destHub}
            className="w-full bg-white border border-[#FF7A00]/40 text-[#FF7A00] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold py-2 rounded-xl">
            + Ajouter ce corridor
          </button>
        </div>
      )}

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {value.map((z, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 text-[10px] font-semibold bg-orange-50 text-[#FF7A00] px-2.5 py-1 rounded-full">
              {z.zone_type === "country" ? countryLabel(z.country_code) : `${hubLabel(z.origin_hub_id)} ↔ ${hubLabel(z.destination_hub_id)}`}
              <button type="button" onClick={() => removeZone(i)}><X className="h-2.5 w-2.5" /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
