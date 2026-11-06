import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Star, ChevronRight, UserPlus, Truck, Loader2 } from "lucide-react";
import { api } from "../../lib/api";

interface Carrier {
  id: string;
  full_name: string;
  phone: string;
  city: string | null;
  rating: number;
  total_trips: number;
  documents_status: "pending" | "validated" | "rejected";
}

export default function FleetCarriers() {
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<Carrier[]>("/carriers")
      .then(setCarriers)
      .catch(err => setError(err instanceof Error ? err.message : "Chargement impossible."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-slate-900 text-base" style={{ fontFamily: "Montserrat, sans-serif" }}>Mes transporteurs</h2>
        <Link to="/flotte/transporteurs/nouveau"
          className="flex items-center gap-1.5 bg-[#FF7A00] hover:bg-[#ff8c1a] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition">
          <UserPlus className="h-3.5 w-3.5" /> Ajouter
        </Link>
      </div>

      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : carriers.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-10">Aucun transporteur enregistré pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {carriers.map(c => (
            <Link key={c.id} to={`/flotte/transporteurs/${c.id}`}
              className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:border-[#FF7A00]/40 transition">
              <div className="w-11 h-11 rounded-xl bg-[#0B2A4A] flex items-center justify-center shrink-0">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-900 truncate">{c.full_name}</p>
                  {c.documents_status === "pending" && (
                    <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full shrink-0">
                      En validation
                    </span>
                  )}
                  {c.documents_status === "rejected" && (
                    <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full shrink-0">
                      Documents rejetés
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">{c.city ?? "—"} • {c.phone}</p>
              </div>
              <div className="text-right shrink-0 flex flex-col items-end gap-1">
                <p className="text-xs font-bold text-amber-500 flex items-center gap-0.5"><Star className="h-3 w-3 fill-amber-500" />{c.rating}</p>
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
