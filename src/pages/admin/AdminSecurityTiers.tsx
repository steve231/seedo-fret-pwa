import { useEffect, useState } from "react";
import { Shield, Plus, Loader2, AlertCircle, X } from "lucide-react";
import { api, ApiError } from "../../lib/api";
import { formatFcfa } from "../../lib/pricing";

interface Tier {
  code: string;
  name: string;
  description: string;
  rank: number;
  surcharge_fcfa: number;
  requires_gps: boolean;
  requires_camera: boolean;
  active: boolean;
}

const EMPTY_FORM = { code: "", name: "", description: "", rank: "", surcharge_fcfa: "", requires_gps: false, requires_camera: false };

export default function AdminSecurityTiers() {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionErrors, setActionErrors] = useState<Record<string, string>>({});
  const [togglingCode, setTogglingCode] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setTiers(await api.get<Tier[]>("/admin/security-tiers"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chargement impossible.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (tier: Tier) => {
    setTogglingCode(tier.code);
    setActionErrors(prev => ({ ...prev, [tier.code]: "" }));
    try {
      await api.patch(`/admin/security-tiers/${tier.code}`, { active: !tier.active });
      await load();
    } catch (err) {
      setActionErrors(prev => ({ ...prev, [tier.code]: err instanceof ApiError ? err.message : "Action impossible." }));
    } finally {
      setTogglingCode(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.code || !form.name || !form.description || form.rank === "" || form.surcharge_fcfa === "") {
      setFormError("Tous les champs sont requis.");
      return;
    }
    setCreating(true);
    try {
      await api.post("/admin/security-tiers", {
        code: form.code,
        name: form.name,
        description: form.description,
        rank: Number(form.rank),
        surcharge_fcfa: Number(form.surcharge_fcfa),
        requires_gps: form.requires_gps,
        requires_camera: form.requires_camera,
        active: false, // inactif à la création — l'admin l'active quand il est prêt à le publier
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
      await load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Création impossible.");
    } finally {
      setCreating(false);
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-slate-900 text-base" style={{ fontFamily: "Montserrat, sans-serif" }}>Options de suivi</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Paliers de sécurité proposés aux expéditeurs (suivi déclaratif, GPS…). Un palier inactif n'est pas visible dans la PWA.
          </p>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className="shrink-0 flex items-center gap-1.5 bg-[#FF7A00] hover:bg-[#ff8c1a] text-white text-xs font-bold px-3 py-2 rounded-xl transition">
          {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />} {showForm ? "Annuler" : "Ajouter"}
        </button>
      </div>

      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3">
          <p className="text-xs font-bold text-slate-900">Nouveau palier</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1">Code (ex: camera)</label>
              <input type="text" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toLowerCase() }))}
                placeholder="camera"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-[#FF7A00] outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1">Rang (ordre cumulatif)</label>
              <input type="number" value={form.rank} onChange={e => setForm(f => ({ ...f, rank: e.target.value }))}
                placeholder="2"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-[#FF7A00] outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-600 mb-1">Nom affiché</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Surveillance caméra"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-[#FF7A00] outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-600 mb-1">Description (affichée à l'expéditeur)</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
              placeholder="Caméra embarquée anti-fraude en cours de route."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-[#FF7A00] outline-none resize-none" />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-600 mb-1">Surcharge (FCFA)</label>
            <input type="number" value={form.surcharge_fcfa} onChange={e => setForm(f => ({ ...f, surcharge_fcfa: e.target.value }))}
              placeholder="8000"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-[#FF7A00] outline-none" />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={form.requires_gps} onChange={e => setForm(f => ({ ...f, requires_gps: e.target.checked }))}
                className="w-3.5 h-3.5 accent-[#FF7A00] rounded cursor-pointer" />
              <span className="text-[10px] font-semibold text-slate-600">Exige un véhicule équipé GPS</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={form.requires_camera} onChange={e => setForm(f => ({ ...f, requires_camera: e.target.checked }))}
                className="w-3.5 h-3.5 accent-[#FF7A00] rounded cursor-pointer" />
              <span className="text-[10px] font-semibold text-slate-600">Exige un véhicule équipé caméra</span>
            </label>
          </div>
          {formError && (
            <p className="flex items-center gap-1.5 text-[10px] text-red-600"><AlertCircle className="h-3 w-3 shrink-0" /> {formError}</p>
          )}
          <p className="text-[10px] text-slate-400">Créé inactif par défaut — activez-le ci-dessous quand il est prêt à être proposé.</p>
          <button type="submit" disabled={creating}
            className="w-full bg-[#0B2A4A] hover:bg-[#14325C] disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2">
            {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />} Créer ce palier
          </button>
        </form>
      )}

      <div className="space-y-3">
        {tiers.map(tier => (
          <div key={tier.code} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#0B2A4A] flex items-center justify-center shrink-0">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-slate-900">{tier.name}</p>
                <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full">rang {tier.rank}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">{tier.description}</p>
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-[#FF7A00]">
                  {tier.surcharge_fcfa > 0 ? `+${formatFcfa(tier.surcharge_fcfa)}` : "Inclus"}
                </span>
                {tier.requires_gps && <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full">Exige GPS</span>}
                {tier.requires_camera && <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full">Exige caméra</span>}
              </div>
              {actionErrors[tier.code] && <p className="text-[10px] text-red-600 mt-2">{actionErrors[tier.code]}</p>}
              <button onClick={() => toggleActive(tier)} disabled={togglingCode === tier.code}
                className={`mt-3 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition ${
                  tier.active ? "bg-white border border-red-200 text-red-500" : "bg-[#FF7A00] hover:bg-[#ff8c1a] text-white"
                }`}>
                {togglingCode === tier.code ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                {tier.active ? "Désactiver" : "Activer"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
