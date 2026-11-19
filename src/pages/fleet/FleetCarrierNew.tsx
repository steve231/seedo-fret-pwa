import { useState } from "react";
import { useNavigate } from "react-router";
import { UserPlus, AlertCircle, Loader2, MapPinned, Upload, CheckCircle2 } from "lucide-react";
import { api, ApiError } from "../../lib/api";
import { ZonePicker, type ZoneEntry } from "../../components/ZonePicker";

function DocumentPicker({ label, file, onPick }: { label: string; file: File | null; onPick: (file: File) => void }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl py-4 cursor-pointer hover:border-[#FF7A00]/40 transition">
        <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) onPick(f); }} />
        {file ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Upload className="h-4 w-4 text-slate-400" />}
        <span className="text-xs font-medium text-slate-500 truncate max-w-[220px]">
          {file ? file.name : "Choisir un fichier (image ou PDF)"}
        </span>
      </label>
    </div>
  );
}

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
    hasGps: false,
  });
  const [zones, setZones] = useState<ZoneEntry[]>([{ zone_type: "country", country_code: "BJ" }]);
  const [vehiclePhoto, setVehiclePhoto] = useState<File | null>(null);
  const [registrationDoc, setRegistrationDoc] = useState<File | null>(null);
  const [licenseDoc, setLicenseDoc] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const uploadDocument = async (path: string, kind: string, file: File) => {
    const formData = new FormData();
    formData.append("kind", kind);
    formData.append("file", file);
    await api.postForm(path, formData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.capacityWeightKg) {
      setError("Nom, téléphone et capacité du véhicule sont requis.");
      return;
    }
    if (!vehiclePhoto || !registrationDoc || !licenseDoc) {
      setError("La photo du véhicule, la carte grise et le permis du transporteur sont requis pour la validation SEEDO.");
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      const carrier = await api.post<{ id: string }>("/carriers", {
        full_name: form.name,
        phone: form.phone,
        city: form.city || null,
        coverage_zones: zones,
      });

      try {
        await uploadDocument(`/carriers/${carrier.id}/documents`, "license", licenseDoc);
      } catch (docErr) {
        setError(
          `Transporteur enregistré, mais le permis n'a pas pu être envoyé : ` +
          (docErr instanceof ApiError ? docErr.message : "erreur inconnue") +
          ". Ajoutez-le depuis sa fiche.",
        );
        setSubmitting(false);
        return;
      }

      let vehicle: { id: string };
      try {
        // Déclaré "pending" par défaut côté backend (vehicles.status) :
        // invisible du Smart Match tant qu'un admin ne l'a pas validé.
        vehicle = await api.post<{ id: string }>("/vehicles", {
          carrier_id: carrier.id,
          gabarit: form.gabarit,
          carrosserie: form.carrosserie,
          capacity_weight_kg: Number(form.capacityWeightKg),
          license_plate: form.licensePlate || null,
          label: form.label || null,
          has_gps: form.hasGps,
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

      try {
        await uploadDocument(`/vehicles/${vehicle.id}/documents`, "photo", vehiclePhoto);
        await uploadDocument(`/vehicles/${vehicle.id}/documents`, "registration", registrationDoc);
      } catch (docErr) {
        setError(
          `Transporteur et véhicule enregistrés, mais les documents du véhicule n'ont pas pu être envoyés : ` +
          (docErr instanceof ApiError ? docErr.message : "erreur inconnue") +
          ". Ajoutez-les depuis sa fiche.",
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
          <label className="flex items-center gap-2.5 cursor-pointer bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5">
            <input type="checkbox" checked={form.hasGps} onChange={e => setForm(f => ({ ...f, hasGps: e.target.checked }))}
              className="w-4 h-4 accent-[#FF7A00] rounded cursor-pointer shrink-0" />
            <span className="text-xs font-semibold text-slate-700">Véhicule équipé d'un traceur GPS</span>
          </label>
          <p className="text-[10px] text-slate-500 -mt-1">
            Permet à ce véhicule d'être proposé sur les commandes exigeant un suivi GPS. Modifiable plus tard depuis sa fiche.
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3">
          <p className="text-xs font-bold text-slate-900">Documents</p>
          <p className="text-[10px] text-slate-500 -mt-2">
            Requis pour la validation SEEDO — sans ces pièces, le véhicule et le transporteur restent invisibles du Smart Match.
          </p>
          <DocumentPicker label="Photo du véhicule" file={vehiclePhoto} onPick={setVehiclePhoto} />
          <DocumentPicker label="Carte grise" file={registrationDoc} onPick={setRegistrationDoc} />
          <DocumentPicker label="Permis de conduire du transporteur" file={licenseDoc} onPick={setLicenseDoc} />
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3">
          <p className="text-xs font-bold text-slate-900 flex items-center gap-2">
            <MapPinned className="h-3.5 w-3.5 text-[#FF7A00]" /> Zone d'action
          </p>
          <p className="text-[10px] text-slate-500 -mt-2">
            Où ce transporteur peut-il opérer ? Utilisé pour ne lui proposer que des trajets qu'il couvre réellement.
          </p>
          <ZonePicker value={zones} onChange={setZones} />
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
