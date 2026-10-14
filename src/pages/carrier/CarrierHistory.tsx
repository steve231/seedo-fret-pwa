import { Package, Star, TrendingUp } from "lucide-react";
import { formatFcfa } from "../../lib/pricing";

const HISTORY = [
  { id: "SF-8841", route: "Cotonou → Calavi", date: "Hier, 16:12", price: 98500, rating: 5 },
  { id: "SF-8790", route: "Akpakpa → Godomey", date: "09 Oct, 11:05", price: 137200, rating: 4 },
  { id: "SF-8722", route: "Cotonou → Porto-Novo", date: "05 Oct, 09:40", price: 112000, rating: 5 },
];

export default function CarrierHistory() {
  const total = HISTORY.reduce((sum, h) => sum + h.price, 0);

  return (
    <div className="space-y-4">
      <h2 className="font-bold text-slate-900 text-base" style={{ fontFamily: "Montserrat, sans-serif" }}>Historique & Performance</h2>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-slate-100 rounded-2xl p-3 text-center shadow-sm">
          <p className="text-base font-extrabold text-slate-900">142</p>
          <p className="text-[10px] text-slate-500">Courses</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-3 text-center shadow-sm">
          <p className="text-base font-extrabold text-amber-500 flex items-center justify-center gap-0.5"><Star className="h-3.5 w-3.5 fill-amber-500" />4.9</p>
          <p className="text-[10px] text-slate-500">Note moyenne</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-3 text-center shadow-sm">
          <p className="text-base font-extrabold text-emerald-600">98%</p>
          <p className="text-[10px] text-slate-500">Ponctualité</p>
        </div>
      </div>

      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-3 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-[#FF7A00] shrink-0" />
        <p className="text-xs text-orange-900"><span className="font-bold">{formatFcfa(total)}</span> gagnés sur les 3 dernières courses</p>
      </div>

      <div className="space-y-3">
        {HISTORY.map(h => (
          <div key={h.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <Package className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900">{h.route}</p>
              <p className="text-[10px] text-slate-400">{h.date} • #{h.id}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-extrabold text-slate-900">{formatFcfa(h.price)}</p>
              <p className="text-[10px] text-amber-500 flex items-center justify-end gap-0.5"><Star className="h-3 w-3 fill-amber-500" />{h.rating}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
