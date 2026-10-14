import { useParams, useNavigate, Link } from "react-router";
import { ArrowLeft, Package, Scale, MapPin, CheckCircle2, LifeBuoy, Star } from "lucide-react";
import { MOCK_SHIPMENTS } from "../data/mockShipments";
import { formatFcfa, PRICING } from "../lib/pricing";

const OFFER_LABEL: Record<string, string> = { eco: "Économique", standard: "Standard", express: "Express" };

export default function ShipmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const shipment = MOCK_SHIPMENTS.find(s => s.id === id);

  if (!shipment) {
    return <p className="text-sm text-slate-500">Course introuvable.</p>;
  }

  const distanceCost = shipment.distanceKm * PRICING.coutKm;
  const tonnageCost = shipment.weight * PRICING.coutTonne;

  return (
    <div className="space-y-4">
      <button onClick={() => navigate("/mes-courses")} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <ArrowLeft className="h-4 w-4" /> Mes courses
      </button>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${shipment.status === "Livré" ? "bg-emerald-100 text-emerald-800" : "bg-orange-100 text-[#FF7A00]"}`}>
            ● {shipment.status}
          </span>
          <span className="text-xs font-bold text-slate-400">Course #{shipment.id}</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <p className="text-sm font-semibold text-slate-800">{shipment.origin}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF7A00] shrink-0" />
            <p className="text-sm font-semibold text-slate-800">{shipment.destination}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 mt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Package className="h-4 w-4 text-[#FF7A00] shrink-0" /> {shipment.cargoLabel}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Scale className="h-4 w-4 text-[#FF7A00] shrink-0" /> {shipment.weight} tonnes
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <MapPin className="h-4 w-4 text-[#FF7A00] shrink-0" /> {shipment.distanceKm} km
          </div>
          {shipment.deliveredAt && (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> Livré {shipment.deliveredAt}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-base border-2 border-[#FF7A00] shrink-0">
          {shipment.driverName.split(" ").map(n => n[0]).join("")}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 text-sm">{shipment.driverName}</h3>
          <p className="text-[11px] text-slate-500">{shipment.driverVehicle}</p>
          <span className="text-xs font-bold text-amber-500 flex items-center gap-1 mt-0.5">
            <Star className="h-3 w-3 fill-amber-500" /> {shipment.driverRating}
          </span>
        </div>
      </div>

      <div className="bg-slate-100 p-3 rounded-xl text-[11px] text-slate-600 space-y-1">
        <div className="flex justify-between"><span>Offre {OFFER_LABEL[shipment.offerType]} :</span><span className="font-semibold">—</span></div>
        <div className="flex justify-between"><span>Forfait Prise en charge :</span><span className="font-semibold">{formatFcfa(PRICING.forfait)}</span></div>
        <div className="flex justify-between"><span>Distance ({shipment.distanceKm} km × {PRICING.coutKm} FCFA) :</span><span className="font-semibold">{formatFcfa(distanceCost)}</span></div>
        <div className="flex justify-between"><span>Tonnage ({shipment.weight}t × {PRICING.coutTonne.toLocaleString("fr-FR")} FCFA) :</span><span className="font-semibold">{formatFcfa(tonnageCost)}</span></div>
        <div className="flex justify-between text-slate-900 font-bold pt-1 border-t border-slate-200">
          <span>Prix Total payé :</span><span>{formatFcfa(shipment.price)}</span>
        </div>
      </div>

      <Link to={`/support?course=${shipment.id}`}
        className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 bg-white border border-slate-200 rounded-2xl py-3">
        <LifeBuoy className="h-4 w-4" /> Signaler un problème sur cette course
      </Link>
    </div>
  );
}
