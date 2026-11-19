import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { PhoneCall, MessageCircle, Truck, Star, ShieldCheck, Clock3, XCircle, Loader2, MapPinned, Pencil, Check, X, FileCheck2, FileX2, Eye, Upload } from "lucide-react";
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
  license_doc_uploaded: boolean;
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
  photo_uploaded: boolean;
  registration_doc_uploaded: boolean;
  has_gps: boolean;
}

function DocBadge({ label, ok }: { label: string; ok: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${ok ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
      {ok ? <FileCheck2 className="h-2.5 w-2.5" /> : <FileX2 className="h-2.5 w-2.5" />} {label}
    </span>
  );
}

function DocAction({ label, uploaded, onView, onUpload }: {
  label: string;
  uploaded: boolean;
  onView: () => Promise<void>;
  onUpload: (file: File) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);

  const handleView = async () => {
    setBusy(true);
    try { await onView(); } finally { setBusy(false); }
  };

  const handlePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try { await onUpload(file); } finally { setBusy(false); e.target.value = ""; }
  };

  if (uploaded) {
    return (
      <button onClick={handleView} disabled={busy} className="flex items-center gap-1 text-[9px] font-semibold text-[#FF7A00]">
        {busy ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Eye className="h-2.5 w-2.5" />} Voir {label}
      </button>
    );
  }
  return (
    <label className="flex items-center gap-1 text-[9px] font-semibold text-[#FF7A00] cursor-pointer">
      <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden" onChange={handlePick} disabled={busy} />
      {busy ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Upload className="h-2.5 w-2.5" />} Ajouter {label}
    </label>
  );
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
  const [savingGps, setSavingGps] = useState<string | null>(null);

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

  const viewCarrierDocument = async () => {
    if (!id) return;
    const blob = await api.getBlob(`/carriers/${id}/documents/license`);
    window.open(URL.createObjectURL(blob), "_blank");
  };

  const uploadCarrierDocument = async (file: File) => {
    if (!id) return;
    const formData = new FormData();
    formData.append("kind", "license");
    formData.append("file", file);
    await api.postForm(`/carriers/${id}/documents`, formData);
    setCarrier(c => c ? { ...c, license_doc_uploaded: true } : c);
  };

  const viewVehicleDocument = async (vehicleId: string, kind: "photo" | "registration") => {
    const blob = await api.getBlob(`/vehicles/${vehicleId}/documents/${kind}`);
    window.open(URL.createObjectURL(blob), "_blank");
  };

  const uploadVehicleDocument = async (vehicleId: string, kind: "photo" | "registration", file: File) => {
    const formData = new FormData();
    formData.append("kind", kind);
    formData.append("file", file);
    await api.postForm(`/vehicles/${vehicleId}/documents`, formData);
    setVehicles(vs => vs.map(v => v.id === vehicleId
      ? { ...v, [kind === "photo" ? "photo_uploaded" : "registration_doc_uploaded"]: true }
      : v));
  };

  const toggleGps = async (vehicle: Vehicle) => {
    setSavingGps(vehicle.id);
    try {
      await api.patch<Vehicle>(`/vehicles/${vehicle.id}/equipment`, { has_gps: !vehicle.has_gps, has_camera: false });
      setVehicles(vs => vs.map(v => v.id === vehicle.id ? { ...v, has_gps: !v.has_gps } : v));
    } finally {
      setSavingGps(null);
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
        <p className="text-xs font-bold text-slate-900 mb-1">Documents</p>
        <p className="text-[10px] text-slate-500 mb-2.5">Requis pour la validation SEEDO.</p>
        <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
          <DocBadge label="Permis du transporteur" ok={carrier.license_doc_uploaded} />
          <DocAction label="le permis" uploaded={carrier.license_doc_uploaded} onView={viewCarrierDocument} onUpload={uploadCarrierDocument} />
        </div>
        {vehicles.map(v => (
          <div key={v.id} className="flex items-center gap-1.5 flex-wrap mt-1.5 pt-1.5 border-t border-slate-100">
            <span className="text-[9px] text-slate-400 shrink-0">{v.label || v.carrosserie} :</span>
            <DocBadge label="Photo véhicule" ok={v.photo_uploaded} />
            <DocAction label="la photo" uploaded={v.photo_uploaded} onView={() => viewVehicleDocument(v.id, "photo")} onUpload={f => uploadVehicleDocument(v.id, "photo", f)} />
            <DocBadge label="Carte grise" ok={v.registration_doc_uploaded} />
            <DocAction label="la carte grise" uploaded={v.registration_doc_uploaded} onView={() => viewVehicleDocument(v.id, "registration")} onUpload={f => uploadVehicleDocument(v.id, "registration", f)} />
          </div>
        ))}
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
              <div key={v.id} className="border border-slate-100 rounded-xl px-3 py-2 space-y-1.5">
                <div className="flex items-center justify-between">
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
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={v.has_gps} disabled={savingGps === v.id} onChange={() => toggleGps(v)}
                    className="w-3.5 h-3.5 accent-[#FF7A00] rounded cursor-pointer shrink-0" />
                  <span className="text-[10px] font-semibold text-slate-600">Équipé GPS</span>
                  {savingGps === v.id && <Loader2 className="h-2.5 w-2.5 animate-spin text-slate-400" />}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
