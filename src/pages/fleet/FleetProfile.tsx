import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { User, Building2, FileText, ShieldCheck, ChevronRight, LogOut, Eye, Settings, LifeBuoy, Loader2, X } from "lucide-react";
import { useAuth } from "../../state/AuthContext";
import { api } from "../../lib/api";
import { CONTRACT_TITLE, CONTRACT_SECTIONS } from "../../data/partnershipContract";

function DocumentRow({ label, onView }: { label: string; onView: () => Promise<void> }) {
  const [loading, setLoading] = useState(false);

  const handleView = async () => {
    setLoading(true);
    try {
      await onView();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">Fournie</span>
        <p className="text-xs font-semibold text-slate-700">{label}</p>
      </div>
      <button onClick={handleView} disabled={loading}
        className="flex items-center gap-1 text-[#FF7A00] text-xs font-semibold shrink-0">
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />} Voir
      </button>
    </div>
  );
}

export default function FleetProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showContract, setShowContract] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/connexion", { replace: true });
  };

  const viewDocument = async (kind: "id_document" | "rccm") => {
    const blob = await api.getBlob(`/users/me/documents/${kind}`);
    window.open(URL.createObjectURL(blob), "_blank");
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-[#0B2A4A] flex items-center justify-center shrink-0">
          {user?.accountType === "business" ? <Building2 className="h-7 w-7 text-white" /> : <User className="h-7 w-7 text-white" />}
        </div>
        <div>
          <h2 className="font-bold text-slate-900 text-sm" style={{ fontFamily: "Montserrat, sans-serif" }}>{user?.name ?? "Gestionnaire de flotte"}</h2>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {user?.accountType === "business" ? "Entreprise" : "Individuel"}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <ShieldCheck className="h-3 w-3" /> Partenaire validé
            </span>
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-2"><FileText className="h-4 w-4 text-[#FF7A00]" /> Documents du partenariat</p>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100">
          <DocumentRow label="Pièce d'identité" onView={() => viewDocument("id_document")} />
          {user?.accountType === "business" && (
            <DocumentRow label="RCCM" onView={() => viewDocument("rccm")} />
          )}
          <button onClick={() => setShowContract(true)}
            className="w-full flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">Accepté</span>
              <p className="text-xs font-semibold text-slate-700">Contrat de partenariat</p>
            </div>
            <span className="flex items-center gap-1 text-[#FF7A00] text-xs font-semibold shrink-0">
              <Eye className="h-3.5 w-3.5" /> Voir
            </span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100">
        <Link to="/flotte/support" className="flex items-center gap-3 px-4 py-3">
          <LifeBuoy className="h-4 w-4 text-[#FF7A00] shrink-0" />
          <p className="flex-1 text-xs font-semibold text-slate-800">Support & litige</p>
          <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
        </Link>
        <Link to="/flotte/parametres" className="flex items-center gap-3 px-4 py-3">
          <Settings className="h-4 w-4 text-[#FF7A00] shrink-0" />
          <p className="flex-1 text-xs font-semibold text-slate-800">Paramètres</p>
          <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
        </Link>
      </div>

      <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-sm font-bold text-red-500 bg-white border border-red-100 rounded-2xl py-3">
        <LogOut className="h-4 w-4" /> Déconnexion
      </button>

      {showContract && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowContract(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-slate-900">{CONTRACT_TITLE}</p>
              <button onClick={() => setShowContract(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <div className="space-y-3">
              {CONTRACT_SECTIONS.map(section => (
                <div key={section.heading}>
                  <p className="text-xs font-bold text-slate-800">{section.heading}</p>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{section.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
