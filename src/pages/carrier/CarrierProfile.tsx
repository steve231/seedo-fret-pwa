import { Link, useNavigate } from "react-router";
import { User, Truck, FileText, ShieldCheck, ChevronRight, LogOut, Upload, Settings, LifeBuoy } from "lucide-react";
import { useAuth } from "../../state/AuthContext";

const DOCUMENTS = [
  { label: "Permis de conduire", status: "Validé" as const },
  { label: "Carte grise du véhicule", status: "Validé" as const },
  { label: "Assurance véhicule", status: "En attente" as const },
];

export default function CarrierProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/connexion", { replace: true });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-[#0B2A4A] flex items-center justify-center shrink-0">
          <User className="h-7 w-7 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-slate-900 text-sm" style={{ fontFamily: "Montserrat, sans-serif" }}>{user?.name ?? "Transporteur"}</h2>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">
            <ShieldCheck className="h-3 w-3" /> Transporteur vérifié
          </span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-2">
          <Truck className="h-4 w-4 text-[#FF7A00]" />
          <p className="text-xs font-bold text-slate-900">Véhicule</p>
        </div>
        <p className="text-xs text-slate-600">Camion Bâché 15 Tonnes (Volvo FH)</p>
        <p className="text-[10px] text-slate-400 mt-0.5">Capacité : 15t • Zone : Cotonou / Calavi</p>
      </div>

      <div>
        <p className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-2"><FileText className="h-4 w-4 text-[#FF7A00]" /> Documents</p>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100">
          {DOCUMENTS.map(doc => (
            <div key={doc.label} className="flex items-center justify-between px-4 py-3">
              <p className="text-xs font-semibold text-slate-700">{doc.label}</p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${doc.status === "Validé" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                {doc.status}
              </span>
            </div>
          ))}
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-semibold text-[#FF7A00]">
            <Upload className="h-4 w-4" /> Ajouter un document
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100">
        <Link to="/transporteur/support" className="flex items-center gap-3 px-4 py-3">
          <LifeBuoy className="h-4 w-4 text-[#FF7A00] shrink-0" />
          <p className="flex-1 text-xs font-semibold text-slate-800">Support & litige</p>
          <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
        </Link>
        <Link to="/transporteur/parametres" className="flex items-center gap-3 px-4 py-3">
          <Settings className="h-4 w-4 text-[#FF7A00] shrink-0" />
          <p className="flex-1 text-xs font-semibold text-slate-800">Paramètres</p>
          <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
        </Link>
      </div>

      <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-sm font-bold text-red-500 bg-white border border-red-100 rounded-2xl py-3">
        <LogOut className="h-4 w-4" /> Déconnexion
      </button>
    </div>
  );
}
