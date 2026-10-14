import { Logo } from "./Logo";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0B2A4A] flex flex-col items-center justify-center px-5 py-10">
      <div className="flex items-center gap-2.5 mb-8">
        <Logo className="h-10 w-10" />
        <h1 className="text-2xl font-extrabold text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>
          SEEDO<span className="text-[#FF7A00]">FRET</span>
        </h1>
      </div>
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6">
        {children}
      </div>
      <p className="text-[10px] text-slate-400 mt-6">Pilote Cotonou / Calavi</p>
    </div>
  );
}
