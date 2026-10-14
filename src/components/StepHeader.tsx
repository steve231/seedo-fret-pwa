import type { LucideIcon } from "lucide-react";

export function StepHeader({ icon: Icon, title, step, total }: { icon: LucideIcon; title: string; step: number; total: number }) {
  return (
    <div className="flex justify-between items-center mb-3">
      <h2 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
        <Icon className="h-4 w-4 text-[#FF7A00]" /> {title}
      </h2>
      <span className="text-[11px] font-medium text-slate-400">Étape {step}/{total}</span>
    </div>
  );
}
