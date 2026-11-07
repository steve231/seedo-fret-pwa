import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ArrowLeft, Package, Scale, MapPin, LifeBuoy, Star, Loader2 } from "lucide-react";
import { api } from "../lib/api";
import { formatFcfa } from "../lib/pricing";

const OFFER_LABEL: Record<string, string> = { eco: "Économique", standard: "Standard", express: "Express" };
const STATUS_LABELS: Record<string, string> = { livre: "Livré", annule: "Annulé" };

interface Order {
  id: string;
  status: string;
  price_final_fcfa: number;
  created_at: string;
  origin_label: string;
  destination_label: string;
  category: string;
  weight_tonnes: number;
  distance_km: number;
  offer_type: string;
  carrier_name: string | null;
  carrier_rating: number | null;
  vehicle_label: string | null;
}

export default function ShipmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Order[]>("/orders")
      .then(orders => setOrder(orders.find(o => o.id === id) ?? null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return <p className="text-sm text-slate-500">Course introuvable.</p>;
  }

  return (
    <div className="space-y-4">
      <button onClick={() => navigate("/mes-courses")} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <ArrowLeft className="h-4 w-4" /> Mes courses
      </button>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${order.status === "livre" ? "bg-emerald-100 text-emerald-800" : "bg-orange-100 text-[#FF7A00]"}`}>
            ● {STATUS_LABELS[order.status] ?? order.status}
          </span>
          <span className="text-xs font-bold text-slate-400">Course #{order.id.slice(0, 8)}</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <p className="text-sm font-semibold text-slate-800">{order.origin_label}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF7A00] shrink-0" />
            <p className="text-sm font-semibold text-slate-800">{order.destination_label}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 mt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Package className="h-4 w-4 text-[#FF7A00] shrink-0" /> {order.category}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Scale className="h-4 w-4 text-[#FF7A00] shrink-0" /> {order.weight_tonnes} tonnes
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <MapPin className="h-4 w-4 text-[#FF7A00] shrink-0" /> {order.distance_km} km
          </div>
        </div>
      </div>

      {order.carrier_name && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-base border-2 border-[#FF7A00] shrink-0">
            {order.carrier_name.split(" ").map(n => n[0]).slice(0, 2).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 text-sm">{order.carrier_name}</h3>
            <p className="text-[11px] text-slate-500">{order.vehicle_label ?? "—"}</p>
            {order.carrier_rating !== null && (
              <span className="text-xs font-bold text-amber-500 flex items-center gap-1 mt-0.5">
                <Star className="h-3 w-3 fill-amber-500" /> {order.carrier_rating}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="bg-slate-100 p-3 rounded-xl text-[11px] text-slate-600 space-y-1">
        <div className="flex justify-between"><span>Offre {OFFER_LABEL[order.offer_type] ?? order.offer_type} :</span><span className="font-semibold">—</span></div>
        <div className="flex justify-between text-slate-900 font-bold pt-1 border-t border-slate-200">
          <span>Prix Total payé :</span><span>{formatFcfa(order.price_final_fcfa)}</span>
        </div>
      </div>

      <Link to={`/support?course=${order.id}`}
        className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 bg-white border border-slate-200 rounded-2xl py-3">
        <LifeBuoy className="h-4 w-4" /> Signaler un problème sur cette course
      </Link>
    </div>
  );
}
