import { useNavigate } from "react-router";
import { Package, ChevronRight, Boxes } from "lucide-react";
import { MOCK_SHIPMENTS } from "../data/mockShipments";
import { formatFcfa } from "../lib/pricing";

const STATUS_STYLE: Record<string, string> = {
  "En cours": "text-[#FF7A00] bg-orange-50",
  "Livré": "text-emerald-600 bg-emerald-50",
  "Annulé": "text-red-500 bg-red-50",
};

export default function MyShipments() {
  const navigate = useNavigate();

  const goTo = (s: typeof MOCK_SHIPMENTS[number]) => {
    navigate(s.status === "En cours" ? `/course/${s.id}` : `/mes-courses/${s.id}`);
  };

  return (
    <div className="space-y-4">
      <h2 className="font-bold text-slate-900 text-base" style={{ fontFamily: "Montserrat, sans-serif" }}>Mes Courses</h2>

      {MOCK_SHIPMENTS.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center">
          <Boxes className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Aucune course pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {MOCK_SHIPMENTS.map(s => (
            <button key={s.id} onClick={() => goTo(s)}
              className="w-full bg-white border border-slate-100 rounded-2xl p-4 text-left shadow-sm flex items-center gap-3 hover:border-[#FF7A00]/40 transition">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                <Package className="h-5 w-5 text-[#FF7A00]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{s.route}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{s.date} • Course #{s.id} • {formatFcfa(s.price)}</p>
                <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[s.status]}`}>{s.status}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
