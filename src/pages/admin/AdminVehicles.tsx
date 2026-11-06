import { useEffect, useState } from "react";
import { Truck, Check, Ban, Clock3, Hash, Loader2 } from "lucide-react";
import { api } from "../../lib/api";

interface Vehicle {
  id: string;
  carrier_name: string | null;
  gabarit: string;
  carrosserie: string;
  capacity_weight_kg: number;
  license_plate: string | null;
  label: string | null;
  status: "pending" | "active" | "suspended";
}

const GABARIT_LABELS: Record<string, string> = {
  leger: "Léger (≤ 3,5t)",
  moyen: "Moyen (3,5t – 19t)",
  lourd: "Lourd (> 19t)",
};

function VehicleCard({ vehicle, onApprove, onSuspend }: {
  vehicle: Vehicle;
  onApprove?: () => void;
  onSuspend?: () => void;
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-start gap-3">
      <div className="w-11 h-11 rounded-xl bg-[#0B2A4A] flex items-center justify-center shrink-0">
        <Truck className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-900 truncate">{vehicle.label || `${vehicle.carrosserie} ${vehicle.capacity_weight_kg}kg`}</p>
        <p className="text-[11px] text-slate-500 mt-1">{vehicle.carrier_name} • {GABARIT_LABELS[vehicle.gabarit] ?? vehicle.gabarit}</p>
        <p className="text-[11px] text-slate-500">{vehicle.carrosserie} • {vehicle.capacity_weight_kg.toLocaleString("fr-FR")} kg</p>
        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5"><Hash className="h-3 w-3" /> {vehicle.license_plate ?? "—"}</p>

        {(onApprove || onSuspend) && (
          <div className="flex items-center gap-2 mt-3">
            {onApprove && (
              <button onClick={onApprove}
                className="flex items-center gap-1.5 bg-[#FF7A00] hover:bg-[#ff8c1a] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition">
                <Check className="h-3.5 w-3.5" /> Valider
              </button>
            )}
            {onSuspend && (
              <button onClick={onSuspend}
                className="flex items-center gap-1.5 bg-white border border-red-200 text-red-500 text-xs font-bold px-3 py-1.5 rounded-xl transition">
                <Ban className="h-3.5 w-3.5" /> Suspendre
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminVehicles() {
  const [pending, setPending] = useState<Vehicle[]>([]);
  const [active, setActive] = useState<Vehicle[]>([]);
  const [suspended, setSuspended] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, a, s] = await Promise.all([
        api.get<Vehicle[]>("/admin/vehicles?status=pending"),
        api.get<Vehicle[]>("/admin/vehicles?status=active"),
        api.get<Vehicle[]>("/admin/vehicles?status=suspended"),
      ]);
      setPending(p);
      setActive(a);
      setSuspended(s);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chargement impossible.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (id: string, status: "active" | "suspended") => {
    await api.patch(`/admin/vehicles/${id}/status`, { status });
    await load();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold text-slate-900 text-base" style={{ fontFamily: "Montserrat, sans-serif" }}>Véhicules</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Un véhicule non validé reste invisible du Smart Match — vérifiez les documents (carte grise, assurance) avant validation.
        </p>
      </div>

      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</div>
      )}

      <div>
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Clock3 className="h-3.5 w-3.5 text-amber-500" /> En attente ({pending.length})
        </h3>
        {pending.length === 0 ? (
          <p className="text-xs text-slate-400">Aucun véhicule en attente.</p>
        ) : (
          <div className="space-y-3">
            {pending.map(v => (
              <VehicleCard key={v.id} vehicle={v} onApprove={() => setStatus(v.id, "active")} />
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">Actifs ({active.length})</h3>
        {active.length === 0 ? (
          <p className="text-xs text-slate-400">Aucun véhicule actif.</p>
        ) : (
          <div className="space-y-3">
            {active.map(v => (
              <VehicleCard key={v.id} vehicle={v} onSuspend={() => setStatus(v.id, "suspended")} />
            ))}
          </div>
        )}
      </div>

      {suspended.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">Suspendus ({suspended.length})</h3>
          <div className="space-y-3">
            {suspended.map(v => (
              <VehicleCard key={v.id} vehicle={v} onApprove={() => setStatus(v.id, "active")} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
