import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, LocateFixed, AlertCircle } from "lucide-react";
import { searchPlaces, reverseGeocode, getCurrentPosition, type PlaceResult } from "../lib/geo";

interface PlaceAutocompleteProps {
  value: string;
  onSelect: (place: PlaceResult) => void;
  placeholder: string;
  dotClassName: string;
}

export function PlaceAutocomplete({ value, onSelect, placeholder, dotClassName }: PlaceAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => setQuery(value), [value]);

  useEffect(() => {
    if (!open || query === value) return; // value == la sélection déjà faite, pas de nouvelle recherche
    const handle = setTimeout(() => {
      setLoading(true);
      searchPlaces(query)
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 400); // respecte la politique d'usage raisonnable de Nominatim (~1 req/s)
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, open]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleSelect = (place: PlaceResult) => {
    setQuery(place.label);
    setOpen(false);
    setResults([]);
    setLocateError(null);
    onSelect(place);
  };

  const handleUseCurrentPosition = async () => {
    setLocating(true);
    setLocateError(null);
    setOpen(false);
    try {
      const { lat, lng } = await getCurrentPosition();
      const label = await reverseGeocode(lat, lng).catch(() => `Position actuelle (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
      handleSelect({ label, lat, lng });
    } catch (err) {
      setLocateError(err instanceof Error ? err.message : "Position indisponible.");
    } finally {
      setLocating(false);
    }
  };

  return (
    <div ref={containerRef} className="relative flex-1">
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotClassName}`} />
        <div className="relative flex-1">
          <input type="text" value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-xs font-medium focus:ring-2 focus:ring-[#FF7A00] outline-none" />
          {loading && <Loader2 className="absolute right-2.5 top-2 h-4 w-4 animate-spin text-slate-400" />}
        </div>
        <button type="button" onClick={handleUseCurrentPosition} disabled={locating}
          title="Utiliser ma position actuelle"
          className="shrink-0 flex items-center justify-center w-8 h-8 rounded-xl border border-slate-200 bg-slate-50 text-[#FF7A00] hover:bg-orange-50 hover:border-[#FF7A00]/40 disabled:opacity-50 transition">
          {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
        </button>
      </div>

      {locateError && (
        <p className="flex items-center gap-1.5 text-[10px] text-red-600 mt-1 ml-5">
          <AlertCircle className="h-3 w-3 shrink-0" /> {locateError}
        </p>
      )}

      {open && (results.length > 0 || (loading && query.length >= 3)) && (
        <div className="absolute z-20 mt-1 left-5 right-0 bg-white border border-slate-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
          {results.map((r, i) => (
            <button key={i} type="button" onClick={() => handleSelect(r)}
              className="w-full flex items-start gap-2 px-3 py-2.5 text-left hover:bg-orange-50 transition border-b border-slate-50 last:border-0">
              <MapPin className="h-3.5 w-3.5 text-[#FF7A00] shrink-0 mt-0.5" />
              <span className="text-xs text-slate-700 leading-snug">{r.label}</span>
            </button>
          ))}
          {!loading && results.length === 0 && query.length >= 3 && (
            <p className="px-3 py-2.5 text-xs text-slate-400">Aucun lieu trouvé.</p>
          )}
        </div>
      )}
    </div>
  );
}
