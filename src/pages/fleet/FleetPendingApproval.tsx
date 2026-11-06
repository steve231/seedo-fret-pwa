import { useNavigate } from "react-router";
import { Clock3, LogOut } from "lucide-react";
import { useAuth } from "../../state/AuthContext";

export default function FleetPendingApproval() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/connexion", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-slate-50">
      <div className="max-w-sm text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center mx-auto">
          <Clock3 className="h-10 w-10 text-[#FF7A00]" />
        </div>
        <div>
          <h2 className="font-extrabold text-slate-900 text-lg" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Demande en cours de traitement
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Votre demande de partenariat gestionnaire de flotte a bien été reçue. L'équipe SEEDO va l'examiner et
            valider votre compte — vous recevrez un appel ou un message dès que c'est fait.
          </p>
        </div>
        <button onClick={handleLogout}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 border border-slate-200 bg-white rounded-2xl px-5 py-3">
          <LogOut className="h-4 w-4" /> Déconnexion
        </button>
      </div>
    </div>
  );
}
