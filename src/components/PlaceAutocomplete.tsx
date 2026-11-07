import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { searchPlaces, type PlaceResult } from "../lib/geo";

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
    onSelect(place);
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
      </div>

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
