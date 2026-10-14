import { Link, useNavigate } from "react-router";
import { User, Phone, Mail, MapPin, ShieldCheck, LogOut, ChevronRight, Settings, LifeBuoy } from "lucide-react";
import { useAuth } from "../state/AuthContext";

export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const MENU = [
    { icon: Phone, label: "Téléphone", value: user?.phone ?? "—" },
    { icon: Mail, label: "Email", value: user?.email ?? "—" },
    { icon: MapPin, label: "Ville", value: "Cotonou" },
  ];

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
          <h2 className="font-bold text-slate-900 text-sm" style={{ fontFamily: "Montserrat, sans-serif" }}>{user?.name ?? "Compte Expéditeur"}</h2>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">
            <ShieldCheck className="h-3 w-3" /> Compte vérifié
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100">
        {MENU.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 px-4 py-3">
            <Icon className="h-4 w-4 text-[#FF7A00] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-slate-400">{label}</p>
              <p className="text-xs font-semibold text-slate-800 truncate">{value}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100">
        <Link to="/support" className="flex items-center gap-3 px-4 py-3">
          <LifeBuoy className="h-4 w-4 text-[#FF7A00] shrink-0" />
          <p className="flex-1 text-xs font-semibold text-slate-800">Support & litige</p>
          <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
        </Link>
        <Link to="/parametres" className="flex items-center gap-3 px-4 py-3">
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
