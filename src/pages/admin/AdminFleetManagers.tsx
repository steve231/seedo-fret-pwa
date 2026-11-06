import { useEffect, useState } from "react";
import { Building2, User, Check, Ban, Clock3, Mail, Phone, Loader2 } from "lucide-react";
import { api } from "../../lib/api";
import type { AccountType } from "../../state/AuthContext";

interface FleetManager {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  city: string | null;
  account_type: AccountType;
  status: "pending" | "active" | "suspended";
}

function FleetManagerCard({ account, onApprove, onSuspend }: {
  account: FleetManager;
  onApprove?: () => void;
  onSuspend?: () => void;
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-start gap-3">
      <div className="w-11 h-11 rounded-xl bg-[#0B2A4A] flex items-center justify-center shrink-0">
        {account.account_type === "business" ? <Building2 className="h-5 w-5 text-white" /> : <User className="h-5 w-5 text-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-slate-900 truncate">{account.full_name}</p>
          <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full shrink-0">
            {account.account_type === "business" ? "Entreprise" : "Individuel"}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-1"><Phone className="h-3 w-3" /> {account.phone}</p>
        {account.email && <p className="text-[11px] text-slate-500 flex items-center gap-1.5"><Mail className="h-3 w-3" /> {account.email}</p>}

        {(onApprove || onSuspend) && (
          <div className="flex items-center gap-2 mt-3">
            {onApprove && (
              <button onClick={onApprove}
                className="flex items-center gap-1.5 bg-[#FF7A00] hover:bg-[#ff8c1a] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition">
                <Check className="h-3.5 w-3.5" /> Approuver
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

export default function AdminFleetManagers() {
  const [pending, setPending] = useState<FleetManager[]>([]);
  const [active, setActive] = useState<FleetManager[]>([]);
  const [suspended, setSuspended] = useState<FleetManager[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, a, s] = await Promise.all([
        api.get<FleetManager[]>("/admin/fleet-managers?status=pending"),
        api.get<FleetManager[]>("/admin/fleet-managers?status=active"),
        api.get<FleetManager[]>("/admin/fleet-managers?status=suspended"),
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
    await api.patch(`/admin/fleet-managers/${id}/status`, { status });
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
        <h2 className="font-bold text-slate-900 text-base" style={{ fontFamily: "Montserrat, sans-serif" }}>Gestionnaires de flotte</h2>
        <p className="text-xs text-slate-500 mt-0.5">Validez les demandes de partenariat avant qu'elles puissent enregistrer des transporteurs.</p>
      </div>

      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</div>
      )}

      <div>
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Clock3 className="h-3.5 w-3.5 text-amber-500" /> En attente ({pending.length})
        </h3>
        {pending.length === 0 ? (
          <p className="text-xs text-slate-400">Aucune demande en attente.</p>
        ) : (
          <div className="space-y-3">
            {pending.map(a => (
              <FleetManagerCard key={a.id} account={a} onApprove={() => setStatus(a.id, "active")} />
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">Actifs ({active.length})</h3>
        {active.length === 0 ? (
          <p className="text-xs text-slate-400">Aucun gestionnaire actif pour le moment.</p>
        ) : (
          <div className="space-y-3">
            {active.map(a => (
              <FleetManagerCard key={a.id} account={a} onSuspend={() => setStatus(a.id, "suspended")} />
            ))}
          </div>
        )}
      </div>

      {suspended.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">Suspendus ({suspended.length})</h3>
          <div className="space-y-3">
            {suspended.map(a => (
              <FleetManagerCard key={a.id} account={a} onApprove={() => setStatus(a.id, "active")} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
