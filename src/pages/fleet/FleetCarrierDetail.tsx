import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { PhoneCall, MessageCircle, Truck, Star, ShieldCheck, Clock3, XCircle, Loader2, MapPinned, Pencil, Check, X } from "lucide-react";
import { api, ApiError } from "../../lib/api";
import { ZonePicker, type ZoneEntry } from "../../components/ZonePicker";
import { getCountries } from "../../lib/zones";

interface CoverageZone {
  id: string;
  zone_type: "country" | "corridor";
  country_code: string | null;
  origin_hub_id: string | null;
  origin_hub_name: string | null;
  destination_hub_id: string | null;
  destination_hub_name: string | null;
}

interface Carrier {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  city: string | null;
  rating: number;
  total_trips: number;
  documents_status: "pending" | "validated" | "rejected";
  coverage_zones: CoverageZone[];
}

interface Vehicle {
  id: string;
  gabarit: string;
  carrosserie: string;
  capacity_weight_kg: number;
  license_plate: string | null;
  label: string | null;
  status: "pending" | "active" | "suspended";
}

function zoneLabel(zone: CoverageZone, countryNames: Record<string, string>): string {
  if (zone.zone_type === "country") return countryNames[zone.country_code ?? ""] ?? zone.country_code ?? "?";
  return `${zone.origin_hub_name ?? "?"} ↔ ${zone.destination_hub_name ?? "?"}`;
}

export default function FleetCarrierDetail() {
  const { id } = useParams();
  const [carrier, setCarrier] = useState<Carrier | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [countryNames, setCountryNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedOnce = useRef(false);

  const [editingZones, setEditingZones] = useState(false);
  const [zonesDraft, setZonesDraft] = useState<ZoneEntry[]>([]);
  const [savingZones, setSavingZones] = useState(false);
  const [zonesError, setZonesError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get<Carrier>(`/carriers/${id}`),
      api.get<Vehicle[]>(`/carriers/${id}/vehicles`),
      getCountries(),
    ])
      .then(([c, v, countries]) => {
        setCarrier(c);
        setVehicles(v);
        setCountryNames(Object.fromEntries(countries.map(co => [co.code, co.name])));
        hasLoadedOnce.current = true;
      })
      .catch(err => { if (!hasLoadedOnce.current) setError(err instanceof Error ? err.message : "Chargement impossible."); })
      .finally(() => setLoading(false));
  }, [id]);

  const startEditingZones = () => {
    if (!carrier) return;
    setZonesDraft(carrier.coverage_zones.map(z => ({
      zone_type: z.zone_type,
      country_code: z.country_code,
      origin_hub_id: z.origin_hub_id,
      destination_hub_id: z.destination_hub_id,
    })));
    setZonesError(null);
    setEditingZones(true);
  };

  const saveZones = async () => {
    if (!id) return;
    setSavingZones(true);
    setZonesError(null);
    try {
      const updated = await api.put<CoverageZone[]>(`/carriers/${id}/zones`, { zones: zonesDraft });
      setCarrier(c => c ? { ...c, coverage_zones: updated } : c);
      setEditingZones(false);
    } catch (err) {
      setZonesError(err instanceof ApiError ? err.message : "Mise à jour impossible.");
    } finally {
      setSavingZones(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error || !carrier) {
    return <p className="text-sm text-slate-500">{error ?? "Transporteur introuvable."}</p>;
  }

  const whatsappNumber = carrier.phone.replace(/[^0-9+]/g, "");

  return (
    <div className="space-y-4">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-[#0B2A4A] flex items-center justify-center shrink-0">
            <Truck className="h-7 w-7 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-slate-900 text-sm" style={{ fontFamily: "Montserrat, sans-serif" }}>{carrier.full_name}</h2>
            {carrier.documents_status === "validated" && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">
                <ShieldCheck className="h-3 w-3" /> Documents validés
              </span>
            )}
            {carrier.documents_status === "pending" && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mt-1">
                <Clock3 className="h-3 w-3" /> En validation SEEDO
              </span>
            )}
            {carrier.documents_status === "rejected" && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full mt-1">
                <XCircle className="h-3 w-3" /> Documents rejetés
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
          <a href={`tel:${carrier.phone}`}
            className="flex-1 flex items-center justify-center gap-2 text-sm font-bold text-[#FF7A00] border-2 border-[#FF7A00]/30 rounded-xl py-2.5">
            <PhoneCall className="h-4 w-4" /> Appeler
          </a>
          <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 text-sm font-bold text-emerald-600 border-2 border-emerald-200 rounded-xl py-2.5">
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-slate-100 rounded-2xl p-3 text-center shadow-sm">
          <p className="text-base font-extrabold text-slate-900">{carrier.total_trips}</p>
          <p className="text-[10px] text-slate-500">Courses</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-3 text-center shadow-sm">
          <p className="text-base font-extrabold text-amber-500 flex items-center justify-center gap-0.5"><Star className="h-3.5 w-3.5 fill-amber-500" />{carrier.rating}</p>
          <p className="text-[10px] text-slate-500">Note moyenne</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-3 text-center shadow-sm flex flex-col items-center justify-center">
          <p className="text-[10px] text-slate-500">{carrier.city ?? "—"}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-slate-900 flex items-center gap-2">
            <MapPinned className="h-4 w-4 text-[#FF7A00]" /> Zone d'action
          </p>
          {!editingZones && (
            <button onClick={startEditingZones} className="flex items-center gap-1 text-[10px] font-bold text-[#FF7A00]">
              <Pencil className="h-3 w-3" /> Modifier
            </button>
          )}
        </div>

        {editingZones ? (
          <div className="space-y-3">
            <ZonePicker value={zonesDraft} onChange={setZonesDraft} />
            {zonesError && <p className="text-[10px] text-red-600">{zonesError}</p>}
            <div className="flex gap-2">
              <button onClick={() => setEditingZones(false)} disabled={savingZones}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 border border-slate-200 rounded-xl py-2">
                <X className="h-3.5 w-3.5" /> Annuler
              </button>
              <button onClick={saveZones} disabled={savingZones}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-[#FF7A00] rounded-xl py-2 disabled:opacity-60">
                {savingZones ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Enregistrer
              </button>
            </div>
          </div>
        ) : carrier.coverage_zones.length === 0 ? (
          <p className="text-xs text-slate-400">Aucune zone déclarée.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {carrier.coverage_zones.map(z => (
              <span key={z.id} className="text-[10px] font-semibold bg-orange-50 text-[#FF7A00] px-2.5 py-1 rounded-full">
                {zoneLabel(z, countryNames)}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-3">
          <Truck className="h-4 w-4 text-[#FF7A00]" />
          <p className="text-xs font-bold text-slate-900">Véhicule{vehicles.length > 1 ? "s" : ""}</p>
        </div>
        {vehicles.length === 0 ? (
          <p className="text-xs text-slate-400">Aucun véhicule déclaré pour ce transporteur.</p>
        ) : (
          <div className="space-y-2">
            {vehicles.map(v => (
              <div key={v.id} className="flex items-center justify-between border border-slate-100 rounded-xl px-3 py-2">
                <div>
                  <p className="text-xs font-semibold text-slate-700">{v.label || `${v.carrosserie} ${v.capacity_weight_kg}kg`}</p>
                  <p className="text-[10px] text-slate-400">{v.license_plate ?? "—"}</p>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                  v.status === "active" ? "bg-emerald-50 text-emerald-600"
                  : v.status === "pending" ? "bg-amber-50 text-amber-600"
                  : "bg-red-50 text-red-600"
                }`}>
                  {v.status === "active" ? "Validé" : v.status === "pending" ? "En validation" : "Suspendu"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
