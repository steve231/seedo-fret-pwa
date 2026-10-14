import { NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { Bell, LogOut } from "lucide-react";
import { Logo } from "./Logo";
import type { TabConfig } from "./navTabs";
import { useAuth } from "../state/AuthContext";

interface AppShellProps {
  tabs: TabConfig[];
  roleLabel: string;
  notificationsPath: string;
}

export function AppShell({ tabs, roleLabel, notificationsPath }: AppShellProps) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/connexion", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:shrink-0 bg-[#0B2A4A] text-white">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
          <Logo className="h-9 w-9" />
          <div>
            <h1 className="font-extrabold text-base leading-none" style={{ fontFamily: "Montserrat, sans-serif" }}>
              SEEDO<span className="text-[#FF7A00]">FRET</span>
            </h1>
            <p className="text-[10px] text-slate-300 font-medium mt-0.5">{roleLabel} · Pilote Cotonou / Calavi</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavLink to={notificationsPath}
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors mb-2 ${isActive ? "bg-[#FF7A00] text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}>
            <Bell className="h-5 w-5" /> Notifications
          </NavLink>
          <div className="border-t border-white/10 mb-2" />
          {tabs.map(tab => {
            const active = tab.match(pathname);
            const Icon = tab.icon;
            return (
              <NavLink key={tab.to} to={tab.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${active ? "bg-[#FF7A00] text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}>
                <Icon className="h-5 w-5" />
                {tab.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="px-5 py-4 border-t border-white/10 space-y-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Smart Match™ actif
          </span>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-slate-300 truncate">{user?.name}</p>
            <button onClick={handleLogout} className="text-slate-400 hover:text-white shrink-0" title="Déconnexion">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-h-screen md:min-h-0">
        {/* Header (mobile only — desktop a déjà le branding dans la sidebar) */}
        <header className="md:hidden safe-top bg-[#0B2A4A] text-white px-5 pt-4 pb-3 flex items-center justify-between shadow-md shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <div>
              <h1 className="font-bold text-base leading-none tracking-wide" style={{ fontFamily: "Montserrat, sans-serif" }}>
                SEEDO<span className="text-[#FF7A00] font-extrabold">FRET</span>
              </h1>
              <p className="text-[10px] text-slate-300 font-medium">{roleLabel} · Cotonou / Calavi</p>
            </div>
          </div>
          <NavLink to={notificationsPath} className="p-1.5 rounded-full bg-white/10 text-slate-200">
            <Bell className="h-4 w-4" />
          </NavLink>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto pb-24 md:pb-8">
          <div className="max-w-3xl mx-auto w-full px-4 py-4 md:px-8 md:py-8">
            <Outlet />
          </div>
        </main>

        {/* Bottom tab bar (mobile only) */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 safe-bottom bg-white border-t border-slate-200 px-2 py-2 flex justify-around items-center shrink-0 z-30">
          {tabs.map(tab => {
            const active = tab.match(pathname);
            const Icon = tab.icon;
            return (
              <NavLink key={tab.to} to={tab.to}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 ${active ? "text-[#FF7A00]" : "text-slate-400"}`}>
                <Icon className="h-5 w-5" />
                <span className={`text-[10px] ${active ? "font-bold" : "font-medium"}`}>{tab.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
