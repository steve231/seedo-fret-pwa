import { useEffect, useState } from "react";
import { Truck, Check, X, Clock3, Loader2 } from "lucide-react";
import { api } from "../../lib/api";

interface Carrier {
  id: string;
  full_name: string;
  phone: string;
  city: string | null;
  documents_status: "pending" | "validated" | "rejected";
}

function CarrierCard({ carrier, onValidate, onReject }: {
  carrier: Carrier;
  onValidate?: () => void;
  onReject?: () => void;
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-start gap-3">
      <div className="w-11 h-11 rounded-xl bg-[#0B2A4A] flex items-center justify-center shrink-0">
        <Truck className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-900 truncate">{carrier.full_name}</p>
        <p className="text-[11px] text-slate-500 mt-1">{carrier.phone} • {carrier.city ?? "—"}</p>

        <div className="flex items-center gap-2 mt-3">
          {onValidate && (
            <button onClick={onValidate}
              className="flex items-center gap-1.5 bg-[#FF7A00] hover:bg-[#ff8c1a] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition">
              <Check className="h-3.5 w-3.5" /> Valider
            </button>
          )}
          {onReject && (
            <button onClick={onReject}
              className="flex items-center gap-1.5 bg-white border border-red-200 text-red-500 text-xs font-bold px-3 py-1.5 rounded-xl transition">
              <X className="h-3.5 w-3.5" /> Rejeter
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminCarrierDocuments() {
  const [pending, setPending] = useState<Carrier[]>([]);
  const [validated, setValidated] = useState<Carrier[]>([]);
  const [rejected, setRejected] = useState<Carrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, v, r] = await Promise.all([
        api.get<Carrier[]>("/admin/carriers?documents_status=pending"),
        api.get<Carrier[]>("/admin/carriers?documents_status=validated"),
        api.get<Carrier[]>("/admin/carriers?documents_status=rejected"),
      ]);
      setPending(p);
      setValidated(v);
      setRejected(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chargement impossible.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (id: string, documents_status: "validated" | "rejected") => {
    await api.patch(`/admin/carriers/${id}/documents-status`, { documents_status });
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
        <h2 className="font-bold text-slate-900 text-base" style={{ fontFamily: "Montserrat, sans-serif" }}>Documents transporteurs</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Validez les pièces (permis, assurance) transmises par le gestionnaire de flotte pour chaque transporteur qu'il enregistre.
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
          <p className="text-xs text-slate-400">Aucun dossier en attente.</p>
        ) : (
          <div className="space-y-3">
            {pending.map(c => (
              <CarrierCard key={c.id} carrier={c}
                onValidate={() => setStatus(c.id, "validated")}
                onReject={() => setStatus(c.id, "rejected")} />
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">Validés ({validated.length})</h3>
        {validated.length === 0 ? (
          <p className="text-xs text-slate-400">Aucun dossier validé.</p>
        ) : (
          <div className="space-y-3">
            {validated.map(c => (
              <CarrierCard key={c.id} carrier={c} onReject={() => setStatus(c.id, "rejected")} />
            ))}
          </div>
        )}
      </div>

      {rejected.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">Rejetés ({rejected.length})</h3>
          <div className="space-y-3">
            {rejected.map(c => (
              <CarrierCard key={c.id} carrier={c} onValidate={() => setStatus(c.id, "validated")} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
