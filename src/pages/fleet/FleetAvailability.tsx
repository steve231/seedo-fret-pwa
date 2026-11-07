import { useEffect, useState } from "react";
import { CalendarClock, MapPin, Repeat2, Check, Truck, Loader2, AlertCircle } from "lucide-react";
import { api, ApiError } from "../../lib/api";

interface Carrier {
  id: string;
  full_name: string;
}

interface Vehicle {
  id: string;
  label: string | null;
  carrosserie: string;
  capacity_weight_kg: number;
  status: "pending" | "active" | "suspended";
}

export default function FleetAvailability() {
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [carrierId, setCarrierId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [loadingCarriers, setLoadingCarriers] = useState(true);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  const [slot, setSlot] = useState<"now" | "today" | "scheduled">("now");
  const [scheduledAt, setScheduledAt] = useState("");
  const [position, setPosition] = useState("Port Autonome de Cotonou");
  const [backhaul, setBackhaul] = useState(false);
  const [backhaulDest, setBackhaulDest] = useState("");
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<Carrier[]>("/carriers")
      .then(setCarriers)
      .catch(err => setError(err instanceof ApiError ? err.message : "Chargement des transporteurs impossible."))
      .finally(() => setLoadingCarriers(false));
  }, []);

  useEffect(() => {
    setVehicleId("");
    setVehicles([]);
    if (!carrierId) return;
    setLoadingVehicles(true);
    api.get<Vehicle[]>(`/carriers/${carrierId}/vehicles`)
      .then(vs => {
        const active = vs.filter(v => v.status === "active");
        setVehicles(active);
        if (active.length > 0) setVehicleId(active[0].id);
      })
      .catch(err => setError(err instanceof ApiError ? err.message : "Chargement des véhicules impossible."))
      .finally(() => setLoadingVehicles(false));
  }, [carrierId]);

  const save = async () => {
    if (!vehicleId) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.post("/availability", {
        vehicle_id: vehicleId,
        slot_type: slot,
        scheduled_at: slot === "scheduled" && scheduledAt ? new Date(scheduledAt).toISOString() : null,
        position_label: position,
        backhaul_enabled: backhaul,
        backhaul_destination: backhaul ? backhaulDest || null : null,
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Enregistrement impossible.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-bold text-slate-900 text-base flex items-center gap-2" style={{ fontFamily: "Montserrat, sans-serif" }}>
        <CalendarClock className="h-5 w-5 text-[#FF7A00]" /> Déclarer une disponibilité
      </h2>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-[#FF7A00]" /> Pour quel transporteur ?
          </label>
          {loadingCarriers ? (
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
          ) : carriers.length === 0 ? (
            <p className="text-xs text-slate-500">Aucun transporteur enregistré pour le moment.</p>
          ) : (
            <select value={carrierId} onChange={e => setCarrierId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#FF7A00] outline-none">
              <option value="">Sélectionner un transporteur</option>
              {carriers.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
            </select>
          )}
        </div>

        {carrierId && (
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Véhicule</label>
            {loadingVehicles ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            ) : vehicles.length === 0 ? (
              <p className="text-xs text-amber-600">Aucun véhicule validé pour ce transporteur — faites valider un véhicule par l'admin avant de déclarer une disponibilité.</p>
            ) : (
              <select value={vehicleId} onChange={e => setVehicleId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#FF7A00] outline-none">
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.label || `${v.carrosserie} ${v.capacity_weight_kg}kg`}</option>
                ))}
              </select>
            )}
          </div>
        )}

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
          {slot === "scheduled" && (
            <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)}
              className="w-full mt-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-[#FF7A00] outline-none" />
          )}
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
                <p className="text-[10px] text-amber-700">Priorité sur l'axe retour</p>
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

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <button disabled={!vehicleId || submitting} onClick={save}
        className="w-full bg-[#FF7A00] hover:bg-[#ff8c1a] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm">
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <><Check className="h-4 w-4" /> Disponibilité enregistrée</> : "Enregistrer la disponibilité"}
      </button>
    </div>
  );
}
