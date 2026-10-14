import { useState } from "react";
import { Settings as SettingsIcon, Bell, Languages, Lock, ChevronRight } from "lucide-react";

export default function Settings() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);

  return (
    <div className="space-y-4">
      <h2 className="font-bold text-slate-900 text-base flex items-center gap-2" style={{ fontFamily: "Montserrat, sans-serif" }}>
        <SettingsIcon className="h-5 w-5 text-[#FF7A00]" /> Paramètres
      </h2>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-4 w-4 text-[#FF7A00] shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-800">Notifications push</p>
              <p className="text-[10px] text-slate-400">Statuts de course, nouvelles missions</p>
            </div>
          </div>
          <button onClick={() => setPushEnabled(v => !v)}
            className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${pushEnabled ? "bg-[#FF7A00]" : "bg-slate-300"}`}>
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${pushEnabled ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-4 w-4 text-[#FF7A00] shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-800">Notifications SMS</p>
              <p className="text-[10px] text-slate-400">Alertes importantes par SMS</p>
            </div>
          </div>
          <button onClick={() => setSmsEnabled(v => !v)}
            className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${smsEnabled ? "bg-[#FF7A00]" : "bg-slate-300"}`}>
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${smsEnabled ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100">
        <button className="w-full flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Languages className="h-4 w-4 text-[#FF7A00] shrink-0" />
            <p className="text-xs font-bold text-slate-800">Langue</p>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="text-[11px] font-semibold">Français</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </button>
        <button className="w-full flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Lock className="h-4 w-4 text-[#FF7A00] shrink-0" />
            <p className="text-xs font-bold text-slate-800">Confidentialité & sécurité</p>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300" />
        </button>
      </div>
    </div>
  );
}
