import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { PhoneCall, MessageCircle, Truck, Star, ShieldCheck, Clock3, XCircle, Loader2 } from "lucide-react";
import { api } from "../../lib/api";

interface Carrier {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  city: string | null;
  rating: number;
  total_trips: number;
  documents_status: "pending" | "validated" | "rejected";
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

export default function FleetCarrierDetail() {
  const { id } = useParams();
  const [carrier, setCarrier] = useState<Carrier | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get<Carrier>(`/carriers/${id}`),
      api.get<Vehicle[]>(`/carriers/${id}/vehicles`),
    ])
      .then(([c, v]) => { setCarrier(c); setVehicles(v); })
      .catch(err => setError(err instanceof Error ? err.message : "Chargement impossible."))
      .finally(() => setLoading(false));
  }, [id]);

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
