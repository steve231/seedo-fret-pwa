import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Route, Repeat2, Clock, ArrowLeft, ArrowRight, Navigation, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { StepHeader } from "../../components/StepHeader";
import { PlaceAutocomplete } from "../../components/PlaceAutocomplete";
import { useShipment } from "../../state/ShipmentContext";
import { getDrivingDistanceKm, findNearestHub, type PlaceResult } from "../../lib/geo";
import { getHubs } from "../../lib/zones";
import { getSecurityTiers, type SecurityTier } from "../../lib/securityTiers";
import { formatFcfa } from "../../lib/pricing";

export default function Step2Route() {
  const navigate = useNavigate();
  const { draft, update } = useShipment();
  const [computing, setComputing] = useState(false);
  const [distanceError, setDistanceError] = useState<string | null>(null);
  const [securityTiers, setSecurityTiers] = useState<SecurityTier[]>([]);

  useEffect(() => {
    getSecurityTiers().then(setSecurityTiers).catch(() => {});
  }, []);

  // Résout le hub le plus proche d'un lieu sélectionné, pour le matching
  // par corridor (zone d'action des transporteurs) — en plus du pays,
  // déjà renvoyé par Nominatim avec le lieu lui-même.
  const resolveHubId = async (place: PlaceResult): Promise<string | null> => {
    try {
      const hubs = await getHubs();
      return findNearestHub({ lat: place.lat, lng: place.lng }, hubs)?.id ?? null;
    } catch {
      return null; // pas bloquant : le matching retombera sur la couverture par pays
    }
  };

  const bothSelected = draft.originLat !== null && draft.originLng !== null
    && draft.destinationLat !== null && draft.destinationLng !== null;

  useEffect(() => {
    if (!bothSelected) return;
    let cancelled = false;
    setComputing(true);
    setDistanceError(null);
    getDrivingDistanceKm(
      { lat: draft.originLat!, lng: draft.originLng! },
      { lat: draft.destinationLat!, lng: draft.destinationLng! },
    )
      .then(km => { if (!cancelled) update({ distanceKm: Math.max(1, Math.round(km * 10) / 10) }); })
      .catch(err => { if (!cancelled) setDistanceError(err instanceof Error ? err.message : "Calcul de distance impossible."); })
      .finally(() => { if (!cancelled) setComputing(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.originLat, draft.originLng, draft.destinationLat, draft.destinationLng]);

  const canContinue = bothSelected && draft.distanceKm > 0 && !computing;

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3">
        <StepHeader icon={Route} title="Itinéraire & option" step={2} total={3} />

        <div className="space-y-2">
          <PlaceAutocomplete
            value={draft.origin}
            placeholder="Rechercher le lieu de chargement"
            dotClassName="bg-emerald-500"
            onSelect={place => {
              update({ origin: place.label, originLat: place.lat, originLng: place.lng, originCountry: place.countryCode, originHubId: null });
              resolveHubId(place).then(hubId => update({ originHubId: hubId }));
            }}
          />
          <PlaceAutocomplete
            value={draft.destination}
            placeholder="Rechercher le lieu de livraison"
            dotClassName="bg-[#FF7A00]"
            onSelect={place => {
              update({ destination: place.label, destinationLat: place.lat, destinationLng: place.lng, destinationCountry: place.countryCode, destinationHubId: null });
              resolveHubId(place).then(hubId => update({ destinationHubId: hubId }));
            }}
          />

          {bothSelected && (
            <div className="bg-blue-50 border border-blue-100 p-2.5 rounded-xl flex items-center gap-2 text-xs text-blue-900">
              <Navigation className="h-4 w-4 text-blue-600 shrink-0" />
              {computing ? (
                <span className="flex items-center gap-1.5 text-blue-700"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Calcul de la distance routière…</span>
              ) : distanceError ? (
                <span className="text-red-600 flex items-center gap-1.5"><AlertCircle className="h-3.5 w-3.5" /> {distanceError}</span>
              ) : (
                <span className="font-semibold">Distance calculée : {draft.distanceKm} km (trajet routier)</span>
              )}
            </div>
          )}
        </div>

        <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Repeat2 className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-900">Retour à vide (Backhaul)</p>
              <p className="text-[10px] text-amber-700">Économisez jusqu'à -20% sur ce trajet</p>
            </div>
          </div>
          <input type="checkbox" checked={draft.backhaul} onChange={e => update({ backhaul: e.target.checked })}
            className="w-4 h-4 accent-[#FF7A00] rounded cursor-pointer shrink-0" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-2">
        <h2 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
          <ShieldCheck className="h-4 w-4 text-[#FF7A00]" /> Niveau de suivi
        </h2>
        <p className="text-[10px] text-slate-500 -mt-1">Plus le niveau est élevé, plus le choix de transporteurs disponibles peut être réduit.</p>
        <div className="space-y-2">
          {securityTiers.map(tier => {
            const selected = draft.securityTier === tier.code;
            return (
              <button key={tier.code} type="button"
                onClick={() => update({ securityTier: tier.code, offers: null, quoteId: null })}
                className={`w-full text-left p-3 rounded-xl border-2 transition ${selected ? "border-[#FF7A00] bg-orange-50" : "border-slate-200"}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${selected ? "text-[#FF7A00]" : "text-slate-900"}`}>{tier.name}</span>
                  <span className={`text-xs font-bold ${tier.surcharge_fcfa > 0 ? "text-slate-700" : "text-emerald-600"}`}>
                    {tier.surcharge_fcfa > 0 ? `+${formatFcfa(tier.surcharge_fcfa)}` : "Inclus"}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">{tier.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3">
        <h2 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-[#FF7A00]" /> Quand ?
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => update({ when: "now" })}
            className={`py-2.5 rounded-xl text-xs font-bold border-2 transition ${draft.when === "now" ? "border-[#FF7A00] bg-orange-50 text-[#FF7A00]" : "border-slate-200 text-slate-500"}`}>
            Maintenant
          </button>
          <button onClick={() => update({ when: "scheduled" })}
            className={`py-2.5 rounded-xl text-xs font-bold border-2 transition ${draft.when === "scheduled" ? "border-[#FF7A00] bg-orange-50 text-[#FF7A00]" : "border-slate-200 text-slate-500"}`}>
            Programmer
          </button>
        </div>
        {draft.when === "scheduled" && (
          <input type="datetime-local" value={draft.scheduledAt} onChange={e => update({ scheduledAt: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-[#FF7A00] outline-none" />
        )}
      </div>

      <div className="flex gap-3">
        <button onClick={() => navigate("/nouvelle-demande")}
          className="shrink-0 bg-white border border-slate-200 text-slate-600 font-bold py-3.5 px-4 rounded-2xl transition flex items-center justify-center">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button onClick={() => navigate("/nouvelle-demande/offres")} disabled={!canContinue}
          className="flex-1 bg-[#FF7A00] hover:bg-[#ff8c1a] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm">
          Calculer les 3 offres SEEDO <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
