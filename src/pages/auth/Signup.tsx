import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Package, Users, ArrowRight, UserPlus, AlertCircle, Loader2 } from "lucide-react";
import { AuthLayout } from "../../components/AuthLayout";
import { useAuth, roleHome, type AccountType, type UserRole } from "../../state/AuthContext";

const ROLE_OPTIONS: { id: UserRole; icon: React.ReactNode; label: string; desc: string }[] = [
  { id: "shipper", icon: <Package className="h-6 w-6" />, label: "Je veux expédier", desc: "Trouver un véhicule pour transporter une marchandise" },
  { id: "fleet_manager", icon: <Users className="h-6 w-6" />, label: "Je gère une flotte de transporteurs", desc: "Enregistrer et superviser vos transporteurs, recevoir leurs courses" },
];

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", accountType: "individual" as AccountType });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    setError(null);
    setSubmitting(true);
    const result = await signup({ ...form, role });
    setSubmitting(false);
    if (!result.ok || !result.user) {
      setError(result.error ?? "Inscription impossible.");
      return;
    }
    // Un gestionnaire de flotte démarre "en attente" : roleHome() l'envoie
    // vers /flotte, qui affiche automatiquement l'écran de validation
    // tant que SEEDO n'a pas traité sa demande (voir RequireActiveFleetManager).
    navigate(roleHome(result.user.role), { replace: true });
  };

  if (!role) {
    return (
      <AuthLayout>
        <h2 className="font-extrabold text-slate-900 text-lg mb-1" style={{ fontFamily: "Montserrat, sans-serif" }}>Créer un compte</h2>
        <p className="text-xs text-slate-500 mb-5">Je souhaite…</p>

        <div className="space-y-2.5">
          {ROLE_OPTIONS.map(opt => (
            <button key={opt.id} onClick={() => setRole(opt.id)}
              className="group w-full flex items-center gap-4 rounded-2xl border border-slate-200 p-4 text-left hover:border-[#FF7A00]/60 hover:bg-orange-50 transition-all">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#FF7A00] group-hover:bg-[#FF7A00] group-hover:text-white transition-all">
                {opt.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-slate-900">{opt.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 flex-shrink-0 text-slate-300 group-hover:text-[#FF7A00] transition-all" />
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-slate-500 mt-5">
          Déjà un compte ? <Link to="/connexion" className="font-bold text-[#FF7A00]">Se connecter</Link>
        </p>
      </AuthLayout>
    );
  }

  const selected = ROLE_OPTIONS.find(o => o.id === role)!;

  return (
    <AuthLayout>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-2">
          <span className="text-[#FF7A00]">{selected.icon}</span>
          <span className="text-sm font-semibold text-[#FF7A00]">{selected.label}</span>
        </div>
        <button onClick={() => setRole(null)} className="text-xs text-slate-400 underline">Changer</button>
      </div>

      <h2 className="font-extrabold text-slate-900 text-lg mb-1" style={{ fontFamily: "Montserrat, sans-serif" }}>Vos informations</h2>
      <p className="text-xs text-slate-500 mb-5">Tous les champs sont requis.</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        {role === "fleet_manager" && (
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Type de compte</label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { id: "individual", label: "Individuel" },
                { id: "business", label: "Entreprise" },
              ] as const).map(opt => (
                <button key={opt.id} type="button"
                  onClick={() => setForm(f => ({ ...f, accountType: opt.id }))}
                  className={`rounded-xl border py-2.5 text-sm font-semibold transition-all ${
                    form.accountType === opt.id
                      ? "border-[#FF7A00] bg-orange-50 text-[#FF7A00]"
                      : "border-slate-200 text-slate-500"
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Nom complet / Entreprise</label>
          <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="ex: Ets Dossou & Fils"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#FF7A00] outline-none" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Téléphone</label>
          <input type="tel" required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            placeholder="+229 XX XX XX XX XX"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#FF7A00] outline-none" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
          <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="votre@email.com"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#FF7A00] outline-none" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Mot de passe</label>
          <input type="password" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            placeholder="••••••••"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#FF7A00] outline-none" />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        <button type="submit" disabled={submitting}
          className="w-full bg-[#FF7A00] hover:bg-[#ff8c1a] disabled:opacity-60 text-white font-bold py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm mt-1">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} {role === "fleet_manager" ? "Envoyer ma demande" : "Créer mon compte"}
        </button>
      </form>
    </AuthLayout>
  );
}
