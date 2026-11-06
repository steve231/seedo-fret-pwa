import { useState } from "react";
import { Truck, Check, X, RotateCcw, Clock3 } from "lucide-react";
import { MOCK_CARRIERS, type Carrier } from "../../data/mockCarriers";

function CarrierCard({ carrier, onValidate, onReject, onReset }: {
  carrier: Carrier;
  onValidate?: () => void;
  onReject?: () => void;
  onReset?: () => void;
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-start gap-3">
      <div className="w-11 h-11 rounded-xl bg-[#0B2A4A] flex items-center justify-center shrink-0">
        <Truck className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-900 truncate">{carrier.name}</p>
        <p className="text-[11px] text-slate-500 mt-1">{carrier.phone} • {carrier.city}</p>
        <p className="text-[11px] text-slate-500 truncate">{carrier.vehicleLabel}</p>

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
          {onReset && (
            <button onClick={onReset}
              className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-500 text-xs font-bold px-3 py-1.5 rounded-xl transition">
              <RotateCcw className="h-3.5 w-3.5" /> Remettre en attente
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminCarrierDocuments() {
  const [version, setVersion] = useState(0);
  const refresh = () => setVersion(v => v + 1);
  void version;

  const pending = MOCK_CARRIERS.filter(c => c.status === "pending");
  const active = MOCK_CARRIERS.filter(c => c.status === "active");
  const rejected = MOCK_CARRIERS.filter(c => c.status === "rejected");

  const setStatus = (id: string, status: Carrier["status"]) => {
    const carrier = MOCK_CARRIERS.find(c => c.id === id);
    if (carrier) carrier.status = status;
    refresh();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold text-slate-900 text-base" style={{ fontFamily: "Montserrat, sans-serif" }}>Documents transporteurs</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Validez les pièces (permis, assurance) transmises par le gestionnaire de flotte pour chaque transporteur qu'il enregistre.
        </p>
      </div>

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
                onValidate={() => setStatus(c.id, "active")}
                onReject={() => setStatus(c.id, "rejected")} />
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">Validés ({active.length})</h3>
        {active.length === 0 ? (
          <p className="text-xs text-slate-400">Aucun dossier validé.</p>
        ) : (
          <div className="space-y-3">
            {active.map(c => (
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
              <CarrierCard key={c.id} carrier={c} onReset={() => setStatus(c.id, "pending")} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
