import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Truck } from "lucide-react";

const CHECKS = [
  { label: "Vérification conformité charge", result: "OK" },
  { label: "Calcul proximité & ponctualité", result: "98,4%" },
  { label: "Optimisation retour à vide", result: "Activé" },
];

export default function Matching() {
  const navigate = useNavigate();
  const [doneCount, setDoneCount] = useState(0);

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setDoneCount(c => Math.min(c + 1, CHECKS.length));
    }, 500);
    const id = `SF-${Math.floor(1000 + Math.random() * 9000)}`;
    const nav = setTimeout(() => navigate(`/course/${id}`, { replace: true }), 2500);
    return () => { clearInterval(stepTimer); clearTimeout(nav); };
  }, [navigate]);

  return (
    <div className="space-y-4 text-center py-6">
      <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-[#FF7A00] pulse-ring" />
        <Truck className="text-[#FF7A00] h-10 w-10 animate-bounce" />
      </div>

      <div>
        <h2 className="font-extrabold text-slate-900 text-base" style={{ fontFamily: "Montserrat, sans-serif" }}>
          SEEDO Smart Match™ en cours...
        </h2>
        <p className="text-xs text-slate-500 mt-1">Analyse des camions disponibles autour de la zone de chargement</p>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-left space-y-2 text-xs">
        {CHECKS.map((check, i) => (
          <div key={check.label} className="flex items-center justify-between text-slate-600">
            <span className={i < doneCount ? "" : "opacity-40"}>● {check.label}</span>
            {i < doneCount
              ? <span className="text-emerald-600 font-bold">{check.result}</span>
              : <span className="text-slate-300 font-bold">…</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
