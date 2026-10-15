import { useEffect, useState } from "react";
import { Download, X, Share, SquarePlus } from "lucide-react";
import { useInstallPrompt } from "../hooks/useInstallPrompt";

const DISMISS_KEY = "seedo_fret_install_dismissed";

export function InstallBanner() {
  const { installed, canInstall, isIos, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === "1");
  const [showIosSteps, setShowIosSteps] = useState(false);

  useEffect(() => {
    if (installed) setDismissed(true);
  }, [installed]);

  const dismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, "1");
  };

  if (dismissed || installed || (!canInstall && !isIos)) return null;

  return (
    <>
      <div className="mb-4 bg-[#0B2A4A] text-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-white/10 relative">
        <button onClick={dismiss} className="absolute top-2 right-2 text-white/50 hover:text-white p-1">
          <X className="h-3.5 w-3.5" />
        </button>
        <div className="w-10 h-10 rounded-xl bg-[#FF7A00] flex items-center justify-center shrink-0">
          <Download className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-xs font-bold">Installez SEEDO Fret</p>
          <p className="text-[10px] text-slate-300">Accédez-y en un geste depuis votre écran d'accueil</p>
        </div>
        <button
          onClick={() => (canInstall ? promptInstall() : setShowIosSteps(true))}
          className="shrink-0 bg-[#FF7A00] hover:bg-[#ff8c1a] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition">
          Installer
        </button>
      </div>

      {showIosSteps && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowIosSteps(false)}>
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-slate-900 text-base" style={{ fontFamily: "Montserrat, sans-serif" }}>
                Ajouter à l'écran d'accueil
              </h3>
              <button onClick={() => setShowIosSteps(false)} className="text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>
            <ol className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-orange-50 text-[#FF7A00] text-xs font-bold flex items-center justify-center shrink-0">1</span>
                <p className="text-sm text-slate-700 flex items-center gap-1.5 flex-wrap">
                  Appuyez sur l'icône <Share className="h-4 w-4 text-[#FF7A00] inline" /> <span className="font-semibold">Partager</span> en bas de Safari
                </p>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-orange-50 text-[#FF7A00] text-xs font-bold flex items-center justify-center shrink-0">2</span>
                <p className="text-sm text-slate-700 flex items-center gap-1.5 flex-wrap">
                  Faites défiler et sélectionnez <SquarePlus className="h-4 w-4 text-[#FF7A00] inline" /> <span className="font-semibold">Sur l'écran d'accueil</span>
                </p>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-orange-50 text-[#FF7A00] text-xs font-bold flex items-center justify-center shrink-0">3</span>
                <p className="text-sm text-slate-700">Appuyez sur <span className="font-semibold">Ajouter</span> en haut à droite</p>
              </li>
            </ol>
          </div>
        </div>
      )}
    </>
  );
}
