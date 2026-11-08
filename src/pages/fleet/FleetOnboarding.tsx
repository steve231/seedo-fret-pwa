import { useState } from "react";
import { useNavigate } from "react-router";
import { FileCheck2, Upload, CheckCircle2, LogOut, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../../state/AuthContext";
import { api, ApiError } from "../../lib/api";
import { CONTRACT_TITLE, CONTRACT_SECTIONS, CONTRACT_VERSION } from "../../data/partnershipContract";

function DocumentUploadCard({ label, uploaded, onUpload }: {
  label: string;
  uploaded: boolean;
  onUpload: (file: File) => Promise<void>;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      await onUpload(file);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Envoi impossible.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-900">{label}</p>
        {uploaded && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="h-3 w-3" /> Fournie
          </span>
        )}
      </div>
      <label className="mt-3 flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl py-5 cursor-pointer hover:border-[#FF7A00]/40 transition">
        <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden"
          onChange={handleChange} disabled={uploading} />
        {uploading ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> : <Upload className="h-4 w-4 text-slate-400" />}
        <span className="text-xs font-medium text-slate-500">
          {uploading ? "Envoi en cours…" : uploaded ? "Remplacer le fichier" : "Choisir un fichier (image ou PDF)"}
        </span>
      </label>
      {error && (
        <p className="flex items-center gap-1.5 text-[10px] text-red-600 mt-2">
          <AlertCircle className="h-3 w-3 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}

export default function FleetOnboarding() {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [accepting, setAccepting] = useState(false);
  const [contractError, setContractError] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  if (!user) return null;

  const uploadDocument = async (kind: "id_document" | "rccm", file: File) => {
    const formData = new FormData();
    formData.append("kind", kind);
    formData.append("file", file);
    await api.postForm("/users/me/documents", formData);
    await refreshUser();
  };

  const acceptContract = async () => {
    setAccepting(true);
    setContractError(null);
    try {
      await api.post("/users/me/accept-contract", { contract_version: CONTRACT_VERSION });
      await refreshUser();
    } catch (err) {
      setContractError(err instanceof ApiError ? err.message : "Impossible d'enregistrer votre acceptation.");
    } finally {
      setAccepting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/connexion", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-md mx-auto space-y-4">
        <div className="text-center mb-2">
          <FileCheck2 className="h-9 w-9 text-[#FF7A00] mx-auto mb-2" />
          <h2 className="font-extrabold text-slate-900 text-lg" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Complétez votre dossier
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Ces documents sont nécessaires avant que SEEDO Fret puisse valider votre partenariat.
          </p>
        </div>

        <DocumentUploadCard
          label="Pièce d'identité"
          uploaded={!!user.idDocumentUploaded}
          onUpload={file => uploadDocument("id_document", file)}
        />

        {user.accountType === "business" && (
          <DocumentUploadCard
            label="RCCM (entreprise)"
            uploaded={!!user.rccmDocumentUploaded}
            onUpload={file => uploadDocument("rccm", file)}
          />
        )}

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3">
          <p className="text-sm font-bold text-slate-900">{CONTRACT_TITLE}</p>
          <div className="max-h-56 overflow-y-auto bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-3">
            <p className="text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 inline-block">
              Brouillon — en cours de validation juridique
            </p>
            {CONTRACT_SECTIONS.map(section => (
              <div key={section.heading}>
                <p className="text-xs font-bold text-slate-800">{section.heading}</p>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{section.body}</p>
              </div>
            ))}
          </div>

          {user.contractAccepted ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="h-3 w-3" /> Contrat accepté
            </span>
          ) : (
            <>
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#FF7A00] rounded cursor-pointer shrink-0" />
                <span className="text-xs text-slate-700">
                  J'ai lu et j'accepte les conditions du contrat de partenariat SEEDO Fret ci-dessus.
                </span>
              </label>

              {contractError && (
                <p className="flex items-center gap-1.5 text-[10px] text-red-600">
                  <AlertCircle className="h-3 w-3 shrink-0" /> {contractError}
                </p>
              )}

              <button onClick={acceptContract} disabled={!checked || accepting}
                className="w-full bg-[#FF7A00] hover:bg-[#ff8c1a] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm">
                {accepting && <Loader2 className="h-4 w-4 animate-spin" />} Accepter et continuer
              </button>
            </>
          )}
        </div>

        <button onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 text-sm font-bold text-slate-500 border border-slate-200 bg-white rounded-2xl py-3">
          <LogOut className="h-4 w-4" /> Déconnexion
        </button>
      </div>
    </div>
  );
}
