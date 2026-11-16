import { useEffect, useState } from "react";
import { Truck, Check, X, Clock3, Loader2, Eye, FileCheck2, FileX2 } from "lucide-react";
import { api, ApiError } from "../../lib/api";

interface Carrier {
  id: string;
  full_name: string;
  phone: string;
  city: string | null;
  documents_status: "pending" | "validated" | "rejected";
  license_doc_uploaded: boolean;
}

function DocBadge({ label, ok }: { label: string; ok: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${ok ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
      {ok ? <FileCheck2 className="h-2.5 w-2.5" /> : <FileX2 className="h-2.5 w-2.5" />} {label}
    </span>
  );
}

function CarrierCard({ carrier, onValidate, onReject, error }: {
  carrier: Carrier;
  onValidate?: () => void;
  onReject?: () => void;
  error?: string | null;
}) {
  const [viewing, setViewing] = useState(false);

  const viewDocument = async () => {
    setViewing(true);
    try {
      const blob = await api.getBlob(`/admin/carriers/${carrier.id}/documents/license`);
      window.open(URL.createObjectURL(blob), "_blank");
    } finally {
      setViewing(false);
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-start gap-3">
      <div className="w-11 h-11 rounded-xl bg-[#0B2A4A] flex items-center justify-center shrink-0">
        <Truck className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-900 truncate">{carrier.full_name}</p>
        <p className="text-[11px] text-slate-500 mt-1">{carrier.phone} • {carrier.city ?? "—"}</p>

        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <DocBadge label="Permis de conduire" ok={carrier.license_doc_uploaded} />
          {carrier.license_doc_uploaded && (
            <button onClick={viewDocument} disabled={viewing}
              className="flex items-center gap-1 text-[9px] font-semibold text-[#FF7A00]">
              {viewing ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Eye className="h-2.5 w-2.5" />} Voir permis
            </button>
          )}
        </div>

        {error && <p className="text-[10px] text-red-600 mt-2">{error}</p>}

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
  const [actionErrors, setActionErrors] = useState<Record<string, string>>({});

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
    setActionErrors(prev => ({ ...prev, [id]: "" }));
    try {
      await api.patch(`/admin/carriers/${id}/documents-status`, { documents_status });
      await load();
    } catch (err) {
      setActionErrors(prev => ({ ...prev, [id]: err instanceof ApiError ? err.message : "Action impossible." }));
    }
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
              <CarrierCard key={c.id} carrier={c} error={actionErrors[c.id]}
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
              <CarrierCard key={c.id} carrier={c} error={actionErrors[c.id]} onReject={() => setStatus(c.id, "rejected")} />
            ))}
          </div>
        )}
      </div>

      {rejected.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">Rejetés ({rejected.length})</h3>
          <div className="space-y-3">
            {rejected.map(c => (
              <CarrierCard key={c.id} carrier={c} error={actionErrors[c.id]} onValidate={() => setStatus(c.id, "validated")} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
