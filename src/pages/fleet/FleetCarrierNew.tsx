import { useState } from "react";
import { useNavigate } from "react-router";
import { UserPlus, AlertCircle, Loader2 } from "lucide-react";
import { api, ApiError } from "../../lib/api";

const GABARITS = [
  { value: "leger", label: "Léger (≤ 3,5t)" },
  { value: "moyen", label: "Moyen (3,5t – 19t)" },
  { value: "lourd", label: "Lourd (> 19t)" },
];

const CARROSSERIES = [
  { value: "bache", label: "Bâché" },
  { value: "frigorifique", label: "Frigorifique" },
  { value: "citerne", label: "Citerne" },
  { value: "benne", label: "Benne" },
  { value: "plateau", label: "Plateau" },
  { value: "fourgon", label: "Fourgon" },
  { value: "porte_conteneur", label: "Porte-conteneur" },
  { value: "tricycle", label: "Tricycle" },
];

export default function FleetCarrierNew() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", phone: "", city: "",
    gabarit: "moyen", carrosserie: "bache", capacityWeightKg: "", label: "", licensePlate: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.capacityWeightKg) {
      setError("Nom, téléphone et capacité du véhicule sont requis.");
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      const carrier = await api.post<{ id: string }>("/carriers", {
        full_name: form.name,
        phone: form.phone,
        city: form.city || null,
      });

      try {
        // Déclaré "pending" par défaut côté backend (vehicles.status) :
        // invisible du Smart Match tant qu'un admin ne l'a pas validé.
        await api.post("/vehicles", {
          carrier_id: carrier.id,
          gabarit: form.gabarit,
          carrosserie: form.carrosserie,
          capacity_weight_kg: Number(form.capacityWeightKg),
          license_plate: form.licensePlate || null,
          label: form.label || null,
        });
      } catch (vehicleErr) {
        // Le transporteur a été créé mais pas son véhicule — on l'indique
        // clairement plutôt que de laisser un transporteur sans véhicule
        // apparaître comme un succès silencieux.
        setError(
          `Transporteur enregistré, mais le véhicule n'a pas pu être ajouté : ` +
          (vehicleErr instanceof ApiError ? vehicleErr.message : "erreur inconnue") +
          ". Ajoutez-le depuis sa fiche.",
        );
        setSubmitting(false);
        return;
      }

      navigate("/flotte/transporteurs", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Inscription impossible. Réessayez.");
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-bold text-slate-900 text-base flex items-center gap-2" style={{ fontFamily: "Montserrat, sans-serif" }}>
        <UserPlus className="h-5 w-5 text-[#FF7A00]" /> Ajouter un transporteur
      </h2>
      <p className="text-xs text-slate-500 -mt-3">
        Vous êtes responsable de ce transporteur : vérifiez ses informations avant de l'enregistrer.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3">
          <p className="text-xs font-bold text-slate-900">Informations du transporteur</p>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nom complet</label>
            <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="ex: Koffi Dossou"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#FF7A00] outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Téléphone</label>
            <input type="tel" required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="+229 XX XX XX XX XX"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#FF7A00] outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Ville</label>
            <input type="text" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
              placeholder="ex: Cotonou"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#FF7A00] outline-none" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3">
          <p className="text-xs font-bold text-slate-900">Véhicule</p>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Gabarit</label>
            <div className="grid grid-cols-3 gap-2">
              {GABARITS.map(g => (
                <button key={g.value} type="button" onClick={() => setForm(f => ({ ...f, gabarit: g.value }))}
                  className={`py-2 rounded-xl text-[11px] font-bold border-2 transition ${form.gabarit === g.value ? "border-[#FF7A00] bg-orange-50 text-[#FF7A00]" : "border-slate-200 text-slate-500"}`}>
                  {g.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Carrosserie</label>
            <select value={form.carrosserie} onChange={e => setForm(f => ({ ...f, carrosserie: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#FF7A00] outline-none">
              {CARROSSERIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Capacité (kg)</label>
            <input type="number" required min={1} value={form.capacityWeightKg}
              onChange={e => setForm(f => ({ ...f, capacityWeightKg: e.target.value }))}
              placeholder="ex: 15000"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#FF7A00] outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Plaque d'immatriculation</label>
            <input type="text" value={form.licensePlate} onChange={e => setForm(f => ({ ...f, licensePlate: e.target.value }))}
              placeholder="ex: AB 1234 RB"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#FF7A00] outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Libellé (optionnel)</label>
            <input type="text" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
              placeholder="ex: Camion Bâché 15 Tonnes (Volvo FH)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#FF7A00] outline-none" />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        <button type="submit" disabled={submitting}
          className="w-full bg-[#FF7A00] hover:bg-[#ff8c1a] disabled:opacity-60 text-white font-bold py-3.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} Enregistrer ce transporteur
        </button>
      </form>
    </div>
  );
}
