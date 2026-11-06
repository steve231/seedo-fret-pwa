import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { LogIn, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { AuthLayout } from "../../components/AuthLayout";
import { useAuth, roleHome } from "../../state/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (!result.ok || !result.user) {
      setError(result.error ?? "Connexion impossible.");
      return;
    }
    navigate(roleHome(result.user.role), { replace: true });
  };

  return (
    <AuthLayout>
      <h2 className="font-extrabold text-slate-900 text-lg mb-1" style={{ fontFamily: "Montserrat, sans-serif" }}>Connexion</h2>
      <p className="text-xs text-slate-500 mb-5">Accédez à votre espace expéditeur ou gestionnaire de flotte.</p>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            placeholder="votre@email.com"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#FF7A00] outline-none" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Mot de passe</label>
          <div className="relative">
            <input type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 pr-10 text-sm font-medium focus:ring-2 focus:ring-[#FF7A00] outline-none" />
            <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-2.5 text-slate-400">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        <button type="submit" disabled={submitting}
          className="w-full bg-[#FF7A00] hover:bg-[#ff8c1a] disabled:opacity-60 text-white font-bold py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />} Se connecter
        </button>
      </form>

      <p className="text-center text-xs text-slate-500 mt-5">
        Pas encore de compte ? <Link to="/inscription" className="font-bold text-[#FF7A00]">S'inscrire</Link>
      </p>
    </AuthLayout>
  );
}
