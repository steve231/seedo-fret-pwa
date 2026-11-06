import { useParams } from "react-router";
import { PhoneCall, MessageCircle, Truck, Star, TrendingUp, ShieldCheck, Clock3, XCircle } from "lucide-react";
import { MOCK_CARRIERS } from "../../data/mockCarriers";

export default function FleetCarrierDetail() {
  const { id } = useParams();
  const carrier = MOCK_CARRIERS.find(c => c.id === id);

  if (!carrier) {
    return <p className="text-sm text-slate-500">Transporteur introuvable.</p>;
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
            <h2 className="font-bold text-slate-900 text-sm" style={{ fontFamily: "Montserrat, sans-serif" }}>{carrier.name}</h2>
            {carrier.status === "active" && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">
                <ShieldCheck className="h-3 w-3" /> Actif
              </span>
            )}
            {carrier.status === "pending" && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mt-1">
                <Clock3 className="h-3 w-3" /> En validation SEEDO
              </span>
            )}
            {carrier.status === "rejected" && (
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
          <p className="text-base font-extrabold text-slate-900">{carrier.totalTrips}</p>
          <p className="text-[10px] text-slate-500">Courses</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-3 text-center shadow-sm">
          <p className="text-base font-extrabold text-amber-500 flex items-center justify-center gap-0.5"><Star className="h-3.5 w-3.5 fill-amber-500" />{carrier.rating}</p>
          <p className="text-[10px] text-slate-500">Note moyenne</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-3 text-center shadow-sm">
          <TrendingUp className="h-4 w-4 text-emerald-600 mx-auto mb-0.5" />
          <p className="text-[10px] text-slate-500">{carrier.city}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-2">
          <Truck className="h-4 w-4 text-[#FF7A00]" />
          <p className="text-xs font-bold text-slate-900">Véhicule</p>
        </div>
        <p className="text-xs text-slate-600">{carrier.vehicleLabel}</p>
      </div>
    </div>
  );
}
